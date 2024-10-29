#include "dbr.h"
#include "template.h"

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

#if defined(_WIN32) || defined(_WIN64)
#include <windows.h>

std::string GetModulePath()
{
	char path[MAX_PATH];
	HMODULE hModule = GetModuleHandle(NULL); // Get handle to the current module (DLL)
	if (hModule != NULL)
	{
		GetModuleFileName(hModule, path, sizeof(path));
		return std::string(path);
	}
	return "";
}

#elif defined(__linux__)
#include <unistd.h>
#include <limits.h>

std::string GetModulePath()
{
	char path[PATH_MAX];
	ssize_t count = readlink("/proc/self/exe", path, PATH_MAX); // Read the symlink to the executable
	if (count != -1)
	{
		path[count] = '\0';
		return std::string(path);
	}
	return "";
}

#elif defined(__APPLE__)
#include <mach-o/dyld.h>

std::string GetModulePath()
{
	char path[1024];
	uint32_t size = sizeof(path);
	if (_NSGetExecutablePath(path, &size) == 0)
	{
		return std::string(path);
	}
	return "";
}

#else
#error "Unsupported platform"
#endif

void MyCapturedResultReceiver::OnDecodedBarcodesReceived(CDecodedBarcodesResult *pResult)
{
	pResult->Retain();
	results.push_back(pResult);
}

MyImageSourceStateListener::MyImageSourceStateListener(CCaptureVisionRouter *router)
{
	m_router = router;
}

void MyImageSourceStateListener::OnImageSourceStateReceived(ImageSourceState state)
{
	if (state == ISS_EXHAUSTED)
	{
		m_router->StopCapturing();
	}
}

std::string GetRelativeFilePath(const std::string &relativePath)
{
	std::string modulePath = GetModulePath();
	if (modulePath.empty())
	{
		printf("Failed to get module path.\n");
		return "";
	}

	// Get the directory of the module
	size_t pos = modulePath.find_last_of("/\\");
	std::string moduleDir = modulePath.substr(0, pos + 1); // Include the slash

	// Construct the full path to the file
	return moduleDir + relativePath;
}

void BarcodeReader::ProcessImage(BarcodeWorker *worker)
{
	CCaptureVisionRouter *handler = worker->handler;
	CCapturedResult *result = NULL;
	if (!worker->useTemplate)
	{
		SimplifiedCaptureVisionSettings pSettings = {};
		handler->GetSimplifiedSettings("", &pSettings);
		pSettings.barcodeSettings.barcodeFormatIds = worker->iFormat <= 0 ? BF_ALL : worker->iFormat;

		char szErrorMsgBuffer[256];
		handler->UpdateSettings("", &pSettings, szErrorMsgBuffer, 256);
	}
	else
	{
		char errorMessage[256];
		int ret = handler->InitSettings(worker->templateContent.c_str(), errorMessage, 256);
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
			worker->fileFetcher->SetFile(worker->buffer, worker->size);
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
			CImageData *imageData = new CImageData(size, data, width, height, width, IPF_GRAYSCALED);
			worker->fileFetcher->SetFile(imageData);
			delete imageData, imageData = NULL;
			delete[] data, data = NULL;
		}
		break;
	case BASE64:
		if (worker->base64string != "")
		{
			worker->fileFetcher->SetFile(worker->buffer, worker->size);
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
			CImageData *imageData = new CImageData(stride * height, worker->buffer, width, height, stride, format);
			worker->fileFetcher->SetFile(imageData);
			delete imageData, imageData = NULL;
		}
		break;
	default:
		worker->fileFetcher->SetFile(worker->filename.c_str());
	}

	char errorMsg[512] = {0};
	int errorCode = worker->handler->StartCapturing("", true, errorMsg, 512);
	if (errorCode != 0)
	{
		printf("StartCapturing: %s\n", errorMsg);
	}

	int endtime = gettime();
	int elapsedTime = endtime - starttime;

	worker->pResults = worker->capturedReceiver->results;
	worker->errorCode = ret;
	worker->elapsedTime = elapsedTime;
}

void BarcodeReader::WrapResults(BarcodeWorker *worker, Napi::Env env, Napi::Object &result)
{
	vector<CDecodedBarcodesResult *> pResults = worker->pResults;
	Napi::Array barcodeResults = Napi::Array::New(env);
	for (int j = 0; j < pResults.size(); j++)
	{
		CDecodedBarcodesResult *barcodeResult = pResults[j];

		if (barcodeResult)
		{
			CFileImageTag *fileTag = (CFileImageTag *)barcodeResult->GetOriginalImageTag();
			int count = barcodeResult->GetItemsCount();

			for (int i = 0; i < count; i++)
			{
				const CBarcodeResultItem *barcodeResultItem = barcodeResult->GetItem(i);
				CPoint *points = barcodeResultItem->GetLocation().points;

				Napi::Object res = Napi::Object::New(env);
				res.Set("format", barcodeResultItem->GetFormatString());
				res.Set("value", barcodeResultItem->GetText());
				res.Set("x1", Napi::Number::New(env, points[0][0]));
				res.Set("y1", Napi::Number::New(env, points[0][1]));
				res.Set("x2", Napi::Number::New(env, points[1][0]));
				res.Set("y2", Napi::Number::New(env, points[1][1]));
				res.Set("x3", Napi::Number::New(env, points[2][0]));
				res.Set("y3", Napi::Number::New(env, points[2][1]));
				res.Set("x4", Napi::Number::New(env, points[3][0]));
				res.Set("y4", Napi::Number::New(env, points[3][1]));
				res.Set("page", Napi::Number::New(env, fileTag->GetPageNumber()));
				res.Set("time", Napi::Number::New(env, worker->elapsedTime));
				res.Set("angle", Napi::Number::New(env, barcodeResultItem->GetAngle()));
				res.Set("isMirrored", Napi::Number::New(env, barcodeResultItem->IsMirrored()));
				barcodeResults.Set(i + j * count, res);
			}

			barcodeResult->Release();
		}
	}

	result = barcodeResults;
	worker->pResults.clear();
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
	int ret = CLicenseManager::InitLicense(license.c_str(), errorMsgBuffer, 512);
	printf("InitLicense: %s\n", errorMsgBuffer);
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
	int ret = CLicenseManager::SetLicenseCachePath(cachePath.c_str());
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
	worker->capturedReceiver = capturedReceiver;
	worker->fileFetcher = fileFetcher;
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
	worker.capturedReceiver = capturedReceiver;
	worker.fileFetcher = fileFetcher;
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
	worker->capturedReceiver = capturedReceiver;
	worker->fileFetcher = fileFetcher;
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
	worker.capturedReceiver = capturedReceiver;
	worker.fileFetcher = fileFetcher;
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
	worker->capturedReceiver = capturedReceiver;
	worker->fileFetcher = fileFetcher;
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
	worker.capturedReceiver = capturedReceiver;
	worker.fileFetcher = fileFetcher;
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
	worker->capturedReceiver = capturedReceiver;
	worker->fileFetcher = fileFetcher;
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
	worker.capturedReceiver = capturedReceiver;
	worker.fileFetcher = fileFetcher;
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
	worker->capturedReceiver = capturedReceiver;
	worker->fileFetcher = fileFetcher;
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
	worker.capturedReceiver = capturedReceiver;
	worker.fileFetcher = fileFetcher;
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
		delete handler;
		handler = NULL;
	}

	if (listener)
	{
		delete listener;
		listener = NULL;
	}

	if (fileFetcher)
	{
		delete fileFetcher;
		fileFetcher = NULL;
	}

	if (capturedReceiver)
	{
		delete capturedReceiver;
		capturedReceiver = NULL;
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
	return Napi::String::New(env, CCaptureVisionRouterModule::GetVersion());
}

BarcodeReader::BarcodeReader(const Napi::CallbackInfo &info) : Napi::ObjectWrap<BarcodeReader>(info)
{
	Napi::Env env = info.Env();
	handler = new CCaptureVisionRouter;
	char errorMsgBuffer[256];
	int ret = handler->InitSettings(jsonString.c_str(), errorMsgBuffer, 256);
	if (ret)
	{
		printf("InitSettings: %s\n", errorMsgBuffer);
	}

	listener = new MyImageSourceStateListener(handler);
	fileFetcher = new CFileFetcher();
	handler->SetInput(fileFetcher);

	capturedReceiver = new MyCapturedResultReceiver;
	handler->AddResultReceiver(capturedReceiver);
	handler->AddImageSourceStateListener(listener);
}

BarcodeReader::~BarcodeReader()
{
	if (handler)
	{
		delete handler;
		handler = NULL;
	}

	if (listener)
	{
		delete listener;
		listener = NULL;
	}

	if (fileFetcher)
	{
		delete fileFetcher;
		fileFetcher = NULL;
	}

	if (capturedReceiver)
	{
		delete capturedReceiver;
		capturedReceiver = NULL;
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