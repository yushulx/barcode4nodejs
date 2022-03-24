#include <node.h>
#include <node_buffer.h>
#include <string.h>
#include <uv.h>
#include "DynamsoftCommon.h"
#include "DynamsoftBarcodeReader.h"

using namespace v8;

#define DBR_NO_MEMORY 0
#define DBR_SUCCESS   1
#define DEFAULT_MEMORY_SIZE 4096

// barcode reader handler
void* hBarcode = NULL; 

typedef enum {
	NO_BUFFER,
	FILE_STREAM,
	YUYV_BUFFER,
	BASE64,
	RGB_BUFFER,
} BufferType;

struct BarcodeWorker
{
    uv_work_t request;              // libuv
	Persistent<Function> callback;	// javascript callback		
	int iFormat;				// barcode types
	char filename[128];				// file name
	TextResultArray *pResults;	// result pointer
	unsigned char *buffer;		    
	int size;						// file size
	int errorCode;					// detection error code
	int width;						// image width
	int height; 					// image height
	BufferType bufferType;			// buffer type
	bool useTemplate;
	int stride;					// image stride
	char *pszBase64;			// image as base64 string
};

/**
 * Create DBR instance
 */
static int createDBR() 
{
    if (!hBarcode) {
        hBarcode = DBR_CreateInstance();
        if (!hBarcode)
        {
            printf("Cannot allocate memory!\n");
            return DBR_NO_MEMORY;
        }
    }

    return DBR_SUCCESS;
}

/**
 * Destroy DBR instance
 */
static void destroyDBR()
{
    if (hBarcode) {
        DBR_DestroyInstance(hBarcode);
    }
}

static bool hasTemplate(const char* pszTemplate) {
	if (!strcmp(pszTemplate, "undefined") || !strcmp(pszTemplate, "")) {
		return false;
	}
	return true;
}

/*
 *	uv_work_cb
 */
static void DetectionWorking(uv_work_t *req)
{
	if (!hBarcode)
	{
		printf("Barcode reader handler not initialized.\n");
		return;
	}
	// get the reference to BarcodeWorker
    BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);

	// Update DBR params
	if (!worker->useTemplate) {
		PublicRuntimeSettings pSettings = {};
		DBR_GetRuntimeSettings(hBarcode, &pSettings);
		pSettings.barcodeFormatIds = worker->iFormat;
		char szErrorMsgBuffer[256];
		DBR_UpdateRuntimeSettings(hBarcode, &pSettings, szErrorMsgBuffer, 256);
	}

	// initialize Dynamsoft Barcode Reader
	TextResultArray *pResults = NULL;

	// decode barcode image
	int ret = 0;
	switch(worker->bufferType)
	{
		case FILE_STREAM:
			{
				if (worker->buffer) {
					ret = DBR_DecodeFileInMemory(hBarcode, worker->buffer, worker->size, "");
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
					unsigned char* data = new unsigned char[size];
					// get Y from YUYV
					for (int i = 0; i < size; i++)
					{
						data[i] = worker->buffer[index];
						index += 2;
					}
					// read barcode
					ret = DBR_DecodeBuffer(hBarcode, data, width, height, width, IPF_GRAYSCALED, "");
					// release memory
					delete []data, data=NULL;
				}
			}
			break;
		case BASE64:
			{
				if (worker->pszBase64) 
				{
					ret = DBR_DecodeBase64String(hBarcode, worker->pszBase64, "");
					free(worker->pszBase64);
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
					
					ret = DBR_DecodeBuffer(hBarcode, worker->buffer, width, height, stride, format, "");
				}
			}
			break;
		default:
			{
				ret = DBR_DecodeFile(hBarcode, worker->filename, "");
			}
	}
	
	if (ret) 
	{
		printf("Detection error: %s\n", DBR_GetErrorString(ret));
	}

	DBR_GetAllTextResults(hBarcode, &pResults);

	// save results to BarcodeWorker
	worker->errorCode = ret;
	worker->pResults = pResults;
}

/*
 *	uv_after_work_cb
 */
static void DetectionDone(uv_work_t *req,int status)
{
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope scope(isolate);
	Local<Context> context = isolate->GetCurrentContext();

    // get the reference to BarcodeWorker
    BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);

	// get barcode results
	TextResultArray *pResults = worker->pResults;
	int errorCode = worker->errorCode;

	// array for storing barcode results
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
			barcodeResults->Set(context, Number::New(isolate, i), result);
		}

		// release memory of barcode results
		DBR_FreeTextResults(&pResults);
	}
	

    // run the callback
	const unsigned argc = 2;
	Local<Number> err = Number::New(isolate, errorCode);
	Local<Value> argv[argc] = {err, barcodeResults};
	Local<Function> cb = Local<Function>::New(isolate, worker->callback);
    cb->Call(context, Null(isolate), argc, argv);

	// release memory of BarcodeWorker
    delete worker;
}

/*
 *	initLicense(license)
 */
void InitLicense(const FunctionCallbackInfo<Value>& args) 
{
	Isolate* isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	if (!createDBR()) {return;}

	String::Utf8Value license(isolate, args[0]);
	char *pszLicense = *license;
	char errorMsgBuffer[512];
	// Click https://www.dynamsoft.com/customer/license/trialLicense/?product=dbr to get a trial license.
	DBR_InitLicense(pszLicense, errorMsgBuffer, 512);
	printf("DBR_InitLicense: %s\n", errorMsgBuffer);
}

/*
 *	create()
 */
void Create(const FunctionCallbackInfo<Value>& args) 
{
	createDBR();
}

/*
 *	destroy()
 */
void Destroy(const FunctionCallbackInfo<Value>& args) 
{
	destroyDBR();
}

/*
 *	decodeFileAsync(fileName, barcodeTypes, callback, template)
 */
void DecodeFileAsync(const FunctionCallbackInfo<Value>& args) 
{
	if (!createDBR()) {return;}

	Isolate* isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	// get arguments
	String::Utf8Value fileName(isolate, args[0]); // file name
	char *pFileName = *fileName;
	int iFormat = args[1]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[2]); // javascript callback function
	String::Utf8Value templateName(isolate, args[3]); // template name
	char *pTemplateName = *templateName;

	// initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	strcpy(worker->filename, pFileName);
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = NULL;
	worker->bufferType = NO_BUFFER;
	
	if (hasTemplate(pTemplateName)) {
		// Load the template.
		char szErrorMsg[256];
		DBR_InitRuntimeSettingsWithString(hBarcode, pTemplateName, CM_OVERWRITE, szErrorMsg, 256);
		worker->useTemplate = true;
	}
	else {
		worker->useTemplate = false;
	}
	
	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, callback, template)
 */
void DecodeFileStreamAsync(const FunctionCallbackInfo<Value>& args) 
{
	if (!createDBR()) {return;}

	Isolate* isolate = args.GetIsolate();
	Local<Context> context = isolate->GetCurrentContext();

	// get arguments
	unsigned char* buffer = (unsigned char*) node::Buffer::Data(args[0]); // file stream
	int fileSize = args[1]->Int32Value(context).ToChecked();	// file size
	int iFormat = args[2]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[3]); // javascript callback function
	String::Utf8Value templateName(isolate, args[4]); // template name
	char *pTemplateName = *templateName;

	// initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = buffer;
	worker->size = fileSize;
	worker->bufferType = FILE_STREAM;
	
	if (hasTemplate(pTemplateName)) {
		// Load the template.
		char szErrorMsg[256];
		DBR_InitRuntimeSettingsWithString(hBarcode, pTemplateName, CM_OVERWRITE, szErrorMsg, 256);
		worker->useTemplate = true;
	}
	else {
		worker->useTemplate = false;
	}
	
	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeBuffer(buffer, width, height, stride, barcodeTypes, callback, template)
 */
void DecodeBufferAsync(const FunctionCallbackInfo<Value>& args) {
	if (!createDBR()) {return;}
	Isolate* isolate = Isolate::GetCurrent();
	Local<Context> context = isolate->GetCurrentContext();

	// get arguments
	unsigned char* buffer = (unsigned char*) node::Buffer::Data(args[0]); // file stream
	int width = args[1]->Int32Value(context).ToChecked();	// image width
	int height = args[2]->Int32Value(context).ToChecked();	// image height
	int stride = args[3]->Int32Value(context).ToChecked(); // stride
	int iFormat = args[4]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[5]); // javascript callback function
	String::Utf8Value templateName(isolate, args[6]); // template name
	char *pTemplateName = *templateName;

	// initialize BarcodeWorker
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
	
	if (hasTemplate(pTemplateName)) {
		// Load the template.
		char szErrorMsg[256];
		DBR_InitRuntimeSettingsWithString(hBarcode, pTemplateName, CM_OVERWRITE, szErrorMsg, 256);
		worker->useTemplate = true;
	}
	else {
		worker->useTemplate = false;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeYUYVAsync(buffer, width, height, barcodeTypes, callback, template)
 */
void DecodeYUYVAsync(const FunctionCallbackInfo<Value>& args) {
	if (!createDBR()) {return;}

	Isolate* isolate = Isolate::GetCurrent();
	Local<Context> context = isolate->GetCurrentContext();

	// get arguments
	unsigned char* buffer = (unsigned char*) node::Buffer::Data(args[0]); // file stream
	int width = args[1]->Int32Value(context).ToChecked();	// image width
	int height = args[2]->Int32Value(context).ToChecked();	// image height
	int iFormat = args[3]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[4]); // javascript callback function
	String::Utf8Value templateName(isolate, args[5]); // template name
	char *pTemplateName = *templateName;

	// initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->buffer = buffer;
	worker->width = width;
	worker->height = height;
	worker->bufferType = YUYV_BUFFER;
	
	if (hasTemplate(pTemplateName)) {
		// Load the template.
		char szErrorMsg[256];
		DBR_InitRuntimeSettingsWithString(hBarcode, pTemplateName, CM_OVERWRITE, szErrorMsg, 256);
		worker->useTemplate = true;
	}
	else {
		worker->useTemplate = false;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	decodeBase64Async(base64, barcodeTypes, callback, template)
 */
void DecodeBase64Async(const FunctionCallbackInfo<Value>& args) {
	if (!createDBR()) {return;}

	Isolate* isolate = Isolate::GetCurrent();
	Local<Context> context = isolate->GetCurrentContext();

	// get arguments
	String::Utf8Value base64(isolate, args[0]); // file name
	char* pszBase64 = *base64;
	int length = base64.length();
	int iFormat = args[1]->Int32Value(context).ToChecked(); // barcode types
	Local<Function> cb = Local<Function>::Cast(args[2]); // javascript callback function
	String::Utf8Value templateName(isolate, args[3]); // template name
	char *pTemplateName = *templateName;

	// initialize BarcodeWorker
	BarcodeWorker *worker = new BarcodeWorker;
	worker->request.data = worker;
	worker->callback.Reset(isolate, cb);
	worker->iFormat = iFormat;
	worker->pResults = NULL;
	worker->pszBase64 = (char*)calloc(length + 1, sizeof(char));
	strcpy(worker->pszBase64, pszBase64);
	worker->bufferType = BASE64;

	if (hasTemplate(pTemplateName)) {
		// Load the template.
		char szErrorMsg[256];
		DBR_InitRuntimeSettingsWithString(hBarcode, pTemplateName, CM_OVERWRITE, szErrorMsg, 256);
		worker->useTemplate = true;
	}
	else {
		worker->useTemplate = false;
	}

	uv_queue_work(uv_default_loop(), &worker->request, (uv_work_cb)DetectionWorking, (uv_after_work_cb)DetectionDone);
}

/*
 *	setParameters(json)
 */
void SetParameters(const FunctionCallbackInfo<Value>& args) {
	if (!createDBR()) {return;}

	Isolate* isolate = Isolate::GetCurrent();
	Local<Context> context = isolate->GetCurrentContext();

	// Get arguments
	String::Utf8Value params(isolate, args[0]); // json string
	char *json = *params;

    // Update template setting
	char errorMessage[DEFAULT_MEMORY_SIZE];
    int ret = DBR_InitRuntimeSettingsWithString(hBarcode, json, CM_OVERWRITE, errorMessage, 256);
    if (ret) 
    {
        printf("Returned value: %d, error message: %s\n", ret, errorMessage);
    }
}

void Init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "create", Create);
	NODE_SET_METHOD(exports, "destroy", Destroy);
	NODE_SET_METHOD(exports, "decodeYUYVAsync", DecodeYUYVAsync);
	NODE_SET_METHOD(exports, "decodeFileStreamAsync", DecodeFileStreamAsync);
	NODE_SET_METHOD(exports, "initLicense", InitLicense);
	NODE_SET_METHOD(exports, "decodeFileAsync", DecodeFileAsync);
	NODE_SET_METHOD(exports, "decodeBase64Async", DecodeBase64Async);
	NODE_SET_METHOD(exports, "setParameters", SetParameters);
	NODE_SET_METHOD(exports, "decodeBufferAsync", DecodeBufferAsync);
}

NODE_MODULE(dbr, Init)