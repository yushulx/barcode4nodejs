#include "dbr.h"

using namespace v8;

#define DBR_NO_MEMORY 0
#define DBR_SUCCESS 1
#define DEFAULT_MEMORY_SIZE 4096

#if !defined(_WIN32) && !defined(_WIN64)
#include <sys/time.h>

int gettime()
{
	struct timeval time;
	gettimeofday(&time, NULL);
	return (int)(time.tv_sec * 1000 * 1000 + time.tv_usec) / 1000;
}
#else
int gettime()
{
	return (int)(GetTickCount());
}
#endif

typedef enum
{
	NO_BUFFER,
	FILE_STREAM,
	YUYV_BUFFER,
	BASE64,
	RGB_BUFFER,
} BufferType;

struct BarcodeWorker
{
	uv_work_t request;			   // libuv
	Persistent<Function> callback; // javascript callback
	int iFormat;				   // barcode types
	std::string filename;			   // file name
	TextResultArray *pResults;	   // result pointer
	unsigned char *buffer;
	int size;			   // file size
	int errorCode;		   // detection error code
	int width;			   // image width
	int height;			   // image height
	BufferType bufferType; // buffer type
	bool useTemplate;
	int stride;		  // image stride
	std::string base64string; // image as base64 string
	std::string templateContent;
	int elapsedTime;
	void *handler;
};

/*
 *	uv_work_cb
 */
static void DetectionWorking(uv_work_t *req)
{
	// Get the reference to BarcodeWorker
	BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);

	// Create a barcode reader instance
	// void *handler = DBR_CreateInstance();

	// Update DBR settings from barcode types or template
	if (!worker->useTemplate)
	{
		PublicRuntimeSettings pSettings = {};
		DBR_GetRuntimeSettings(worker->handler, &pSettings);
		pSettings.barcodeFormatIds = worker->iFormat;
		char szErrorMsgBuffer[256];
		DBR_UpdateRuntimeSettings(worker->handler, &pSettings, szErrorMsgBuffer, 256);
	}
	else
	{
		char errorMessage[DEFAULT_MEMORY_SIZE];
		int ret = DBR_InitRuntimeSettingsWithString(worker->handler, worker->templateContent.c_str(), CM_OVERWRITE, errorMessage, 256);
		if (ret)
		{
			printf("Returned value: %d, error message: %s\n", ret, errorMessage);
		}
	}

	// Decode barcodes from different sources
	int starttime = gettime();
	int ret = 0;
	switch (worker->bufferType)
	{
	case FILE_STREAM:
	{
		if (worker->buffer)
		{
			ret = DBR_DecodeFileInMemory(worker->handler, worker->buffer, worker->size, "");
		}
	}
	break;
	case YUYV_BUFFER:
	{
		if (worker->buffer)
		{
			int width = worker->width, height = worker->height;
			int size = width * height;
			int index = 0;
			unsigned char *data = new unsigned char[size];
			// get Y from YUYV
			for (int i = 0; i < size; i++)
			{
				data[i] = worker->buffer[index];
				index += 2;
			}
			// read barcode
			ret = DBR_DecodeBuffer(worker->handler, data, width, height, width, IPF_GRAYSCALED, "");
			// release memory
			delete[] data, data = NULL;
		}
	}
	break;
	case BASE64:
	{
		if (worker->base64string != "")
		{
			ret = DBR_DecodeBase64String(worker->handler, worker->base64string.c_str(), "");
		}
	}
	break;
	case RGB_BUFFER:
	{
		if (worker->buffer)
		{
			int width = worker->width, height = worker->height, stride = worker->stride;
			ImagePixelFormat format = IPF_RGB_888;

			if (width == stride)
			{
				format = IPF_GRAYSCALED;
			}
			else if (width * 3 == stride)
			{
				format = IPF_RGB_888;
			}
			else if (width * 4 == stride)
			{
				format = IPF_ARGB_8888;
			}

			ret = DBR_DecodeBuffer(worker->handler, worker->buffer, width, height, stride, format, "");
		}
	}
	break;
	default:
	{
		ret = DBR_DecodeFile(worker->handler, worker->filename.c_str(), "");
	}
	}

	int endtime = gettime();
	int elapsedTime = endtime - starttime;

	if (ret)
	{
		printf("Detection error: %s\n", DBR_GetErrorString(ret));
	}

	DBR_GetAllTextResults(worker->handler, &worker->pResults);

	// Save results to BarcodeWorker
	worker->errorCode = ret;
	worker->elapsedTime = elapsedTime;

	// Release BarcodeReader instance
	// if (handler)
	// {
	// 	DBR_DestroyInstance(handler);
	// }
}

/*
 *	uv_after_work_cb
 */
static void DetectionDone(uv_work_t *req, int status)
{
	Isolate *isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	Local<Context> context = isolate->GetCurrentContext();

	// Get the reference to BarcodeWorker
	BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);

	// Get barcode results
	TextResultArray *pResults = worker->pResults;
	int errorCode = worker->errorCode;

	// Array for storing barcode results
	Local<Array> barcodeResults = Array::New(isolate);

	if (pResults)
	{
		int count = pResults->resultsCount;

		for (int i = 0; i < count; i++)
		{
			Local<Object> result = Object::New(isolate);
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "format", NewStringType::kNormal).ToLocalChecked(), String::NewFromUtf8(isolate, pResults->results[i]->barcodeFormatString, NewStringType::kNormal).ToLocalChecked());
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "value", NewStringType::kNormal).ToLocalChecked(), String::NewFromUtf8(isolate, pResults->results[i]->barcodeText, NewStringType::kNormal).ToLocalChecked());
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "x1", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->x1));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "y1", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->y1));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "x2", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->x2));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "y2", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->y2));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "x3", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->x3));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "y3", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->y3));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "x4", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->x4));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "y4", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, pResults->results[i]->localizationResult->y4));
			result->DefineOwnProperty(context, String::NewFromUtf8(isolate, "time", NewStringType::kNormal).ToLocalChecked(), Number::New(isolate, worker->elapsedTime));
			barcodeResults->Set(context, Number::New(isolate, i), result);
		}

		// Release memory of barcode results
		DBR_FreeTextResults(&pResults);
	}

	// Run the JS callback
	const unsigned argc = 2;
	Local<Number> err = Number::New(isolate, errorCode);
	Local<Value> argv[argc] = {err, barcodeResults};
	Local<Function> cb = Local<Function>::New(isolate, worker->callback);
	cb->Call(context, Null(isolate), argc, argv);

	// Release memory of BarcodeWorker
	delete worker;
}

/*
 *	initLicense(license)
 */
void InitLicense(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	String::Utf8Value license(isolate, args[0]);
	char *pszLicense = *license;
	char errorMsgBuffer[512];
	// Click https://www.dynamsoft.com/customer/license/trialLicense/?product=dbr to get a trial license.
	DBR_InitLicense(pszLicense, errorMsgBuffer, 512);
	printf("DBR_InitLicense: %s\n", errorMsgBuffer);
}

/*
 *	decodeFileAsync(fileName, barcodeTypes, callback, template)
 */
void BarcodeReader::DecodeFileAsync(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<Object> jsObj = args.Holder(); // The JavaScript object this function was called on
	BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(jsObj);

	// Get arguments
	String::Utf8Value fileName(isolate, args[0]); // file name
	int iFormat = args[1]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[2]);	// javascript callback function
	String::Utf8Value templateContent(isolate, args[3]);	// template content

	// Initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->filename = *fileName;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = NULL;
	worker->bufferType = NO_BUFFER;
	worker->templateContent = *templateContent;
	worker->handler = obj->handler;

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, callback, template)
 */
void BarcodeReader::DecodeFileStreamAsync(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<Object> jsObj = args.Holder(); // The JavaScript object this function was called on
	BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(jsObj);

	// Get arguments
	unsigned char *buffer = (unsigned char *)node::Buffer::Data(args[0]); // file stream
	int fileSize = args[1]->Int32Value(context).ToChecked();			  // file size
	int iFormat = args[2]->Int32Value(context).ToChecked();				  // barcode types
	Local<Function> cb = Local<Function>::Cast(args[3]);				  // javascript callback function
	String::Utf8Value templateContent(isolate, args[4]);				  // template content

	// Initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = buffer;
	worker->size = fileSize;
	worker->bufferType = FILE_STREAM;
	worker->templateContent = *templateContent;
	worker->handler = obj->handler;

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeBuffer(buffer, width, height, stride, barcodeTypes, callback, template)
 */
void BarcodeReader::DecodeBufferAsync(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<Object> jsObj = args.Holder(); // The JavaScript object this function was called on
	BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(jsObj);

	// Get arguments
	unsigned char *buffer = (unsigned char *)node::Buffer::Data(args[0]); // file stream
	int width = args[1]->Int32Value(context).ToChecked();				  // image width
	int height = args[2]->Int32Value(context).ToChecked();				  // image height
	int stride = args[3]->Int32Value(context).ToChecked();				  // stride
	int iFormat = args[4]->Int32Value(context).ToChecked();				  // barcode types
	Local<Function> cb = Local<Function>::Cast(args[5]);				  // javascript callback function
	String::Utf8Value templateContent(isolate, args[6]);				  // template content

	// Initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = buffer;
	worker->width = width;
	worker->height = height;
	worker->bufferType = RGB_BUFFER;
	worker->stride = stride;
	worker->templateContent = *templateContent;
	worker->handler = obj->handler;

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeYUYVAsync(buffer, width, height, barcodeTypes, callback, template)
 */
void BarcodeReader::DecodeYUYVAsync(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<Object> jsObj = args.Holder(); // The JavaScript object this function was called on
	BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(jsObj);

	// Get arguments
	unsigned char *buffer = (unsigned char *)node::Buffer::Data(args[0]); // file stream
	int width = args[1]->Int32Value(context).ToChecked();				  // image width
	int height = args[2]->Int32Value(context).ToChecked();				  // image height
	int iFormat = args[3]->Int32Value(context).ToChecked();				  // barcode types
	Local<Function> cb = Local<Function>::Cast(args[4]);				  // javascript callback function
	String::Utf8Value templateContent(isolate, args[5]);				  // template content

	// Initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = buffer;
	worker->width = width;
	worker->height = height;
	worker->bufferType = YUYV_BUFFER;
	worker->templateContent = *templateContent;
	worker->handler = obj->handler;

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeBase64Async(base64, barcodeTypes, callback, template)
 */
void BarcodeReader::DecodeBase64Async(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<Object> jsObj = args.Holder(); // The JavaScript object this function was called on
	BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(jsObj);

	// Get arguments
	String::Utf8Value base64(isolate, args[0]);				// file name
	int iFormat = args[1]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[2]);	// javascript callback function
	String::Utf8Value templateContent(isolate, args[3]);	// template content

	// Initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->base64string = *base64;
	worker->bufferType = BASE64;
	worker->templateContent = *templateContent;
	worker->handler = obj->handler;

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	GetVersionNumber()
 *
 *	returns the version number of the dll
 */
void GetVersionNumber(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = Isolate::GetCurrent();
	args.GetReturnValue().Set(String::NewFromUtf8(
								  isolate, DBR_GetVersion())
								  .ToLocalChecked());
}

BarcodeReader::BarcodeReader() {}

BarcodeReader::~BarcodeReader() {
	if (handler)
	{
		DBR_DestroyInstance(handler);
	}
}

void BarcodeReader::Init(Local<Object> exports)
{
	Isolate *isolate = exports->GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	Local<ObjectTemplate> addon_data_tpl = ObjectTemplate::New(isolate);
	addon_data_tpl->SetInternalFieldCount(1); // 1 field for the BarcodeReader::New()
	Local<Object> addon_data =
		addon_data_tpl->NewInstance(context).ToLocalChecked();

	// Prepare constructor template
	Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New, addon_data);
	tpl->SetClassName(String::NewFromUtf8(isolate, "BarcodeReader").ToLocalChecked());
	tpl->InstanceTemplate()->SetInternalFieldCount(1);

	// Prototype
	NODE_SET_PROTOTYPE_METHOD(tpl, "decodeYUYVAsync", DecodeYUYVAsync);
	NODE_SET_PROTOTYPE_METHOD(tpl, "decodeFileStreamAsync", DecodeFileStreamAsync);
	NODE_SET_PROTOTYPE_METHOD(tpl, "decodeFileAsync", DecodeFileAsync);
	NODE_SET_PROTOTYPE_METHOD(tpl, "decodeBase64Async", DecodeBase64Async);
	NODE_SET_PROTOTYPE_METHOD(tpl, "decodeBufferAsync", DecodeBufferAsync);

	Local<Function> constructor = tpl->GetFunction(context).ToLocalChecked();
	// Static methods
	NODE_SET_METHOD(v8::Local<v8::Object>::Cast(constructor), "createInstance", CreateInstance);
	addon_data->SetInternalField(0, constructor);
	exports->Set(context, String::NewFromUtf8(isolate, "BarcodeReader").ToLocalChecked(),
				 constructor)
		.FromJust();
}

void BarcodeReader::New(const FunctionCallbackInfo<Value> &args)
{
	Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();
	
	void *handler = DBR_CreateInstance();
	
	if (args.IsConstructCall())
	{
		// Invoked as constructor: `new BarcodeReader(...)`
		BarcodeReader *obj = new BarcodeReader();
		obj->handler = handler;
		obj->Wrap(args.This());
		args.GetReturnValue().Set(args.This());
	}
	else
	{
		// Invoked as plain function `BarcodeReader(...)`, turn into construct call.
		const int argc = 1;
		Local<Value> argv[argc] = {args[0]};
		Local<Function> cons =
			args.Data().As<Object>()->GetInternalField(0).As<Function>();
		Local<Object> result =
			cons->NewInstance(context, argc, argv).ToLocalChecked();
		BarcodeReader* obj = ObjectWrap::Unwrap<BarcodeReader>(result);
		obj->handler = handler;
		args.GetReturnValue().Set(result);
	}
}

void BarcodeReader::CreateInstance(const v8::FunctionCallbackInfo<v8::Value> &args) {
    Isolate *isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	void *handler = DBR_GetInstance();
	if (!handler)
	{
		printf("DBR_GetInstance cannot work\n");
		args.GetReturnValue().Set(Null(isolate));
	}
	else 
	{
		BarcodeReader *obj = new BarcodeReader();
		obj->handler = handler;
		obj->Wrap(args.This());
		args.GetReturnValue().Set(args.This());
	}
}

void Init(Local<Object> exports)
{
	NODE_SET_METHOD(exports, "initLicense", InitLicense);
	NODE_SET_METHOD(exports, "getVersionNumber", GetVersionNumber);

	BarcodeReader::Init(exports);
}

NODE_MODULE(dbr, Init)