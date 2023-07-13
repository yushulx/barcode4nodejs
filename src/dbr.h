#ifndef DBR_H
#define DBR_H

#include <node.h>
#include <node_object_wrap.h>

#include <node_buffer.h>
#include <string.h>
#include <uv.h>

#include <vector>
#include <thread>
#include <queue>
#include <functional>

#include "DynamsoftCommon.h"
#include "DynamsoftBarcodeReader.h"

// https://nodejs.org/api/addons.html
class BarcodeReader : public node::ObjectWrap
{
public:
    static void Init(v8::Local<v8::Object> exports);
    void *handler;
    
private:
    explicit BarcodeReader();
    ~BarcodeReader();
    static void CreateInstance(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void New(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DecodeYUYVAsync(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DecodeFileStreamAsync(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DecodeFileAsync(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DecodeBase64Async(const v8::FunctionCallbackInfo<v8::Value> &args);
    static void DecodeBufferAsync(const v8::FunctionCallbackInfo<v8::Value> &args);
};

#endif