// https://nodejs.org/dist/latest-v12.x/docs/api/addons.html#addons_n_api
#ifndef DBR_H
#define DBR_H

#include <napi.h>
#include <string>
#include <uv.h>
#include "DynamsoftCaptureVisionRouter.h"

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
    uv_work_t request;                // libuv
    Napi::FunctionReference callback; // javascript callback
    int iFormat;                      // barcode types
    std::string filename;             // file name
    void *pResults;                   // result pointer
    unsigned char *buffer;
    int size;              // file size
    int errorCode;         // detection error code
    int width;             // image width
    int height;            // image height
    BufferType bufferType; // buffer type
    bool useTemplate;
    int stride;               // image stride
    std::string base64string; // image as base64 string
    std::string templateContent;
    int elapsedTime;
    void *handler;
};

class BarcodeReader : public Napi::ObjectWrap<BarcodeReader>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    BarcodeReader(const Napi::CallbackInfo &info);
    ~BarcodeReader();

private:
    void *handler;

    static Napi::FunctionReference constructor;

    Napi::Value DecodeYUYVAsync(const Napi::CallbackInfo &info);
    Napi::Value DecodeFileStreamAsync(const Napi::CallbackInfo &info);
    Napi::Value DecodeFileAsync(const Napi::CallbackInfo &info);
    Napi::Value DecodeBase64Async(const Napi::CallbackInfo &info);
    Napi::Value DecodeBufferAsync(const Napi::CallbackInfo &info);
    void DestroyInstance(const Napi::CallbackInfo &info);

    Napi::Value DecodeYUYV(const Napi::CallbackInfo &info);
    Napi::Value DecodeFileStream(const Napi::CallbackInfo &info);
    Napi::Value DecodeFile(const Napi::CallbackInfo &info);
    Napi::Value DecodeBase64(const Napi::CallbackInfo &info);
    Napi::Value DecodeBuffer(const Napi::CallbackInfo &info);

    static void ProcessImage(BarcodeWorker *worker);
    static void WrapResults(BarcodeWorker *worker, Napi::Env env, Napi::Object &result);
};

#endif // DBR_H