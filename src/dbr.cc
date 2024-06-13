#include "dbr.h"
Napi::FunctionReference BarcodeReader::constructor;

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

void BarcodeReader::ProcessImage(BarcodeWorker *worker)
{
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

	int starttime = gettime();
	int ret = 0;
	switch (worker->bufferType)
	{
	case FILE_STREAM:
		if (worker->buffer)
		{
			ret = DBR_DecodeFileInMemory(worker->handler, worker->buffer, worker->size, "");
		}
		break;
	case YUYV_BUFFER:
		if (worker->buffer)
		{
			int width = worker->width, height = worker->height;
			int size = width * height;
			int index = 0;
			unsigned char *data = new unsigned char[size];
			for (int i = 0; i < size; i++)
			{
				data[i] = worker->buffer[index];
				index += 2;
			}
			ret = DBR_DecodeBuffer(worker->handler, data, width, height, width, IPF_GRAYSCALED, "");
			delete[] data, data = NULL;
		}
		break;
	case BASE64:
		if (worker->base64string != "")
		{
			ret = DBR_DecodeBase64String(worker->handler, worker->base64string.c_str(), "");
		}
		break;
	case RGB_BUFFER:
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
		break;
	default:
		ret = DBR_DecodeFile(worker->handler, worker->filename.c_str(), "");
		break;
	}

	int endtime = gettime();
	int elapsedTime = endtime - starttime;
	if (ret)
	{
		printf("Detection error: %s\n", DBR_GetErrorString(ret));
	}
	DBR_GetAllTextResults(worker->handler, &worker->pResults);
	worker->errorCode = ret;
	worker->elapsedTime = elapsedTime;
}

void BarcodeReader::WrapResults(BarcodeWorker *worker, Napi::Env env, Napi::Object &result)
{
	TextResultArray *pResults = worker->pResults;
	if (pResults)
	{
		int count = pResults->resultsCount;
		Napi::Array barcodeResults = Napi::Array::New(env, count);

		for (int i = 0; i < count; i++)
		{
			Napi::Object res = Napi::Object::New(env);
			res.Set("format", pResults->results[i]->barcodeFormatString);
			res.Set("value", pResults->results[i]->barcodeText);
			res.Set("x1", Napi::Number::New(env, pResults->results[i]->localizationResult->x1));
			res.Set("y1", Napi::Number::New(env, pResults->results[i]->localizationResult->y1));
			res.Set("x2", Napi::Number::New(env, pResults->results[i]->localizationResult->x2));
			res.Set("y2", Napi::Number::New(env, pResults->results[i]->localizationResult->y2));
			res.Set("x3", Napi::Number::New(env, pResults->results[i]->localizationResult->x3));
			res.Set("y3", Napi::Number::New(env, pResults->results[i]->localizationResult->y3));
			res.Set("x4", Napi::Number::New(env, pResults->results[i]->localizationResult->x4));
			res.Set("y4", Napi::Number::New(env, pResults->results[i]->localizationResult->y4));
			res.Set("page", Napi::Number::New(env, pResults->results[i]->localizationResult->pageNumber));
			res.Set("time", Napi::Number::New(env, worker->elapsedTime));
			barcodeResults.Set(i, res);
		}

		result = barcodeResults;
		DBR_FreeTextResults(&pResults);
	}
}

/*
 *	initLicense(license)
 */
Napi::Value InitLicense(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	if (info.Length() < 1 || !info[0].IsString())
	{
		Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
		return env.Undefined();
	}

	std::string license = info[0].As<Napi::String>();
	char errorMsgBuffer[512];
	int ret = DBR_InitLicense(license.c_str(), errorMsgBuffer, 512);
	printf("DBR_InitLicense: %s\n", errorMsgBuffer);
	return Napi::Number::New(env, ret);
}

/*
 *	setLicenseCachePath(path)
 */
Napi::Value SetLicenseCachePath(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	if (info.Length() < 1 || !info[0].IsString())
	{
		Napi::TypeError::New(env, "String expected").ThrowAsJavaScriptException();
		return env.Undefined();
	}

	std::string cachePath = info[0].As<Napi::String>();
	int ret = DBR_SetLicenseCachePath(cachePath.c_str());
	return Napi::Number::New(env, ret);
}

/*
 *	decodeFileAsync(fileName, barcodeTypes, callback, template)
 */
Napi::Value BarcodeReader::DecodeFileAsync(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker *worker = new BarcodeWorker();
	worker->request.data = worker;
	worker->handler = handler;
	worker->filename = info[0].As<Napi::String>();
	worker->iFormat = info[1].As<Napi::Number>().Int32Value();
	worker->callback = Napi::Persistent(info[2].As<Napi::Function>());
	worker->templateContent = info[3].As<Napi::String>();

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	worker->bufferType = NO_BUFFER;

	uv_queue_work(uv_default_loop(), &worker->request, [](uv_work_t *req)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        ProcessImage(worker); }, [](uv_work_t *req, int status)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        Napi::Env env = worker->callback.Env();
        Napi::HandleScope scope(env);

        Napi::Object result = Napi::Object::New(env);
        WrapResults(worker, env, result);

        worker->callback.Call({Napi::Number::New(env, worker->errorCode), result});
        worker->callback.Reset();
        delete worker; });

	return env.Undefined();
}

Napi::Value BarcodeReader::DecodeFile(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker worker;
	worker.handler = handler;
	worker.filename = info[0].As<Napi::String>();
	worker.iFormat = info[1].As<Napi::Number>().Int32Value();
	worker.templateContent = info[2].As<Napi::String>();

	if (worker.templateContent == "undefined" || worker.templateContent.empty())
	{
		worker.useTemplate = false;
	}
	else
	{
		worker.useTemplate = true;
	}

	worker.bufferType = NO_BUFFER;

	ProcessImage(&worker);

	Napi::Object result = Napi::Object::New(env);
	WrapResults(&worker, env, result);

	return result;
}

/*
 *	decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, callback, template)
 */
Napi::Value BarcodeReader::DecodeFileStreamAsync(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker *worker = new BarcodeWorker();
	worker->request.data = worker;
	worker->handler = handler;
	worker->buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker->size = info[1].As<Napi::Number>().Int32Value();
	worker->iFormat = info[2].As<Napi::Number>().Int32Value();
	worker->callback = Napi::Persistent(info[3].As<Napi::Function>());
	worker->templateContent = info[4].As<Napi::String>();

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	worker->bufferType = FILE_STREAM;

	uv_queue_work(uv_default_loop(), &worker->request, [](uv_work_t *req)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        ProcessImage(worker); }, [](uv_work_t *req, int status)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        Napi::Env env = worker->callback.Env();
        Napi::HandleScope scope(env);

        Napi::Object result = Napi::Object::New(env);
        WrapResults(worker, env, result);

        worker->callback.Call({Napi::Number::New(env, worker->errorCode), result});
        worker->callback.Reset();
        delete worker; });

	return env.Undefined();
}

Napi::Value BarcodeReader::DecodeFileStream(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker worker;
	worker.handler = handler;
	worker.buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker.size = info[1].As<Napi::Number>().Int32Value();
	worker.iFormat = info[2].As<Napi::Number>().Int32Value();
	worker.templateContent = info[3].As<Napi::String>();

	if (worker.templateContent == "undefined" || worker.templateContent.empty())
	{
		worker.useTemplate = false;
	}
	else
	{
		worker.useTemplate = true;
	}

	worker.bufferType = FILE_STREAM;

	ProcessImage(&worker);

	Napi::Object result = Napi::Object::New(env);
	WrapResults(&worker, env, result);

	return result;
}

/*
 *	decodeBuffer(buffer, width, height, stride, barcodeTypes, callback, template)
 */
Napi::Value BarcodeReader::DecodeBufferAsync(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker *worker = new BarcodeWorker();
	worker->request.data = worker;
	worker->handler = handler;
	worker->buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker->width = info[1].As<Napi::Number>().Int32Value();
	worker->height = info[2].As<Napi::Number>().Int32Value();
	worker->stride = info[3].As<Napi::Number>().Int32Value();
	worker->iFormat = info[4].As<Napi::Number>().Int32Value();
	worker->callback = Napi::Persistent(info[5].As<Napi::Function>());
	worker->templateContent = info[6].As<Napi::String>();

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	worker->bufferType = RGB_BUFFER;

	uv_queue_work(uv_default_loop(), &worker->request, [](uv_work_t *req)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        ProcessImage(worker); }, [](uv_work_t *req, int status)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        Napi::Env env = worker->callback.Env();
        Napi::HandleScope scope(env);

        Napi::Object result = Napi::Object::New(env);
        WrapResults(worker, env, result);

        worker->callback.Call({Napi::Number::New(env, worker->errorCode), result});
        worker->callback.Reset();
        delete worker; });

	return env.Undefined();
}

Napi::Value BarcodeReader::DecodeBuffer(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker worker;
	worker.handler = handler;
	worker.buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker.width = info[1].As<Napi::Number>().Int32Value();
	worker.height = info[2].As<Napi::Number>().Int32Value();
	worker.stride = info[3].As<Napi::Number>().Int32Value();
	worker.iFormat = info[4].As<Napi::Number>().Int32Value();
	worker.templateContent = info[5].As<Napi::String>();

	if (worker.templateContent == "undefined" || worker.templateContent.empty())
	{
		worker.useTemplate = false;
	}
	else
	{
		worker.useTemplate = true;
	}

	worker.bufferType = RGB_BUFFER;

	ProcessImage(&worker);

	Napi::Object result = Napi::Object::New(env);
	WrapResults(&worker, env, result);

	return result;
}

/*
 *	decodeYUYVAsync(buffer, width, height, barcodeTypes, callback, template)
 */
Napi::Value BarcodeReader::DecodeYUYVAsync(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker *worker = new BarcodeWorker();
	worker->request.data = worker;
	worker->handler = handler;
	worker->buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker->width = info[1].As<Napi::Number>().Int32Value();
	worker->height = info[2].As<Napi::Number>().Int32Value();
	worker->iFormat = info[3].As<Napi::Number>().Int32Value();
	worker->callback = Napi::Persistent(info[4].As<Napi::Function>());
	worker->templateContent = info[5].As<Napi::String>();

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	worker->bufferType = YUYV_BUFFER;

	uv_queue_work(uv_default_loop(), &worker->request, [](uv_work_t *req)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        ProcessImage(worker); }, [](uv_work_t *req, int status)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        Napi::Env env = worker->callback.Env();
        Napi::HandleScope scope(env);

        Napi::Object result = Napi::Object::New(env);
        WrapResults(worker, env, result);

        worker->callback.Call({Napi::Number::New(env, worker->errorCode), result});
        worker->callback.Reset();
        delete worker; });

	return env.Undefined();
}

Napi::Value BarcodeReader::DecodeYUYV(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker worker;
	worker.handler = handler;
	worker.buffer = (unsigned char *)info[0].As<Napi::Buffer<unsigned char>>().Data();
	worker.width = info[1].As<Napi::Number>().Int32Value();
	worker.height = info[2].As<Napi::Number>().Int32Value();
	worker.iFormat = info[3].As<Napi::Number>().Int32Value();
	worker.templateContent = info[4].As<Napi::String>();

	if (worker.templateContent == "undefined" || worker.templateContent.empty())
	{
		worker.useTemplate = false;
	}
	else
	{
		worker.useTemplate = true;
	}

	worker.bufferType = YUYV_BUFFER;

	ProcessImage(&worker);

	Napi::Object result = Napi::Object::New(env);
	WrapResults(&worker, env, result);

	return result;
}

/*
 *	decodeBase64Async(base64, barcodeTypes, callback, template)
 */
Napi::Value BarcodeReader::DecodeBase64Async(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker *worker = new BarcodeWorker();
	worker->request.data = worker;
	worker->handler = handler;
	worker->base64string = info[0].As<Napi::String>();
	worker->iFormat = info[1].As<Napi::Number>().Int32Value();
	worker->callback = Napi::Persistent(info[2].As<Napi::Function>());
	worker->templateContent = info[3].As<Napi::String>();

	if (worker->templateContent == "undefined" || worker->templateContent.empty())
	{
		worker->useTemplate = false;
	}
	else
	{
		worker->useTemplate = true;
	}

	worker->bufferType = BASE64;

	uv_queue_work(uv_default_loop(), &worker->request, [](uv_work_t *req)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        ProcessImage(worker); }, [](uv_work_t *req, int status)
				  {
        BarcodeWorker *worker = static_cast<BarcodeWorker *>(req->data);
        Napi::Env env = worker->callback.Env();
        Napi::HandleScope scope(env);

        Napi::Object result = Napi::Object::New(env);
        WrapResults(worker, env, result);

        worker->callback.Call({Napi::Number::New(env, worker->errorCode), result});
        worker->callback.Reset();
        delete worker; });

	return env.Undefined();
}

Napi::Value BarcodeReader::DecodeBase64(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	BarcodeWorker worker;
	worker.handler = handler;
	worker.base64string = info[0].As<Napi::String>();
	worker.iFormat = info[1].As<Napi::Number>().Int32Value();
	worker.templateContent = info[2].As<Napi::String>();

	if (worker.templateContent == "undefined" || worker.templateContent.empty())
	{
		worker.useTemplate = false;
	}
	else
	{
		worker.useTemplate = true;
	}

	worker.bufferType = BASE64;

	ProcessImage(&worker);

	Napi::Object result = Napi::Object::New(env);
	WrapResults(&worker, env, result);

	return result;
}

/*
 *	destroyInstance()
 */
void BarcodeReader::DestroyInstance(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	if (handler)
	{
		if (instanceType == "concurrent")
		{
			DBR_RecycleInstance(handler);
		}
		else
		{
			DBR_DestroyInstance(handler);
		}
		handler = NULL;
	}
}

/*
 *	GetVersionNumber()
 *
 *	returns the version number of the dll
 */
Napi::String GetVersionNumber(const Napi::CallbackInfo &info)
{
	Napi::Env env = info.Env();
	return Napi::String::New(env, DBR_GetVersion());
}

BarcodeReader::BarcodeReader(const Napi::CallbackInfo &info) : Napi::ObjectWrap<BarcodeReader>(info)
{
	Napi::Env env = info.Env();
	if (info.Length() >= 1 && info[0].IsString())
	{
		instanceType = info[0].As<Napi::String>();
		if (instanceType == "concurrent")
		{
			handler = DBR_GetInstance();
		}
		else
		{
			handler = DBR_CreateInstance();
		}
	}
	else
	{
		handler = DBR_CreateInstance();
		instanceType = "default";
	}
}

BarcodeReader::~BarcodeReader()
{
	if (handler)
	{
		if (instanceType == "concurrent")
		{
			DBR_RecycleInstance(handler);
		}
		else
		{
			DBR_DestroyInstance(handler);
		}
		handler = NULL;
	}
}

Napi::Object BarcodeReader::Init(Napi::Env env, Napi::Object exports)
{
	Napi::Function func = DefineClass(env, "BarcodeReader", {InstanceMethod("decodeYUYVAsync", &BarcodeReader::DecodeYUYVAsync), InstanceMethod("decodeFileStreamAsync", &BarcodeReader::DecodeFileStreamAsync), InstanceMethod("decodeFileAsync", &BarcodeReader::DecodeFileAsync), InstanceMethod("decodeBase64Async", &BarcodeReader::DecodeBase64Async), InstanceMethod("decodeBufferAsync", &BarcodeReader::DecodeBufferAsync), InstanceMethod("destroyInstance", &BarcodeReader::DestroyInstance), InstanceMethod("decodeYUYV", &BarcodeReader::DecodeYUYV), InstanceMethod("decodeFileStream", &BarcodeReader::DecodeFileStream), InstanceMethod("decodeFile", &BarcodeReader::DecodeFile), InstanceMethod("decodeBase64", &BarcodeReader::DecodeBase64), InstanceMethod("decodeBuffer", &BarcodeReader::DecodeBuffer)});

	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();

	exports.Set("BarcodeReader", func);
	return exports;
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
	exports.Set(Napi::String::New(env, "initLicense"), Napi::Function::New(env, InitLicense));
	exports.Set(Napi::String::New(env, "getVersionNumber"), Napi::Function::New(env, GetVersionNumber));
	exports.Set(Napi::String::New(env, "setLicenseCachePath"), Napi::Function::New(env, SetLicenseCachePath));
	BarcodeReader::Init(env, exports);
	return exports;
}

NODE_API_MODULE(dbr, Init)