# Node.js Barcode Reader SDK
![version](https://img.shields.io/npm/v/barcode4nodejs.svg)

The Node.js barcode reader SDK is implemented by wrapping [Dynamsoft Barcode Reader C++ SDK](https://www.dynamsoft.com/barcode-reader/overview/). It helps developers to build Node.js barcode apps for Windows, Linux, macOS, and Raspberry Pi.

## What You Should Know
- [![](https://img.shields.io/badge/Download-Offline%20SDK-orange)](https://www.dynamsoft.com/barcode-reader/downloads)
- [![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial%20License-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dbr)


## Requirements
- Dynamsoft Barcode Reader v8.8
- Platform-specific C/C++ compiler
- node-gyp

    ```
    npm i node-gyp -g
    ```

## Quick Usage

```js
const dbr = require('barcode4nodejs');
dbr.initLicense("LICENSE-KEY")
dbr.decodeFileAsync("YOUR IMAGE FILE", dbr.formats.OneD | dbr.formats.PDF417 | dbr.formats.QRCode | dbr.formats.DataMatrix | dbr.formats.Aztec, function(err, msg){
  console.log(msg)
}, "");
```

## How to Customize and Build the Module for Windows, Linux, macOS and Raspberry Pi

1. Get the source code:

    ```
    git clone https://github.com/yushulx/nodejs-barcode.git
    ```

2. Edit `src/dbr.cc` and `index.js`. 

    **Note: The current source code is only compatible with Dynamsoft Barcode Reader v7.4**.

3. Replace the library files in `platforms/` with yours.

4. Build the Node.js extension:

    ```
    node-gyp configure
    node-gyp build
    ```

    **For Visual Studio 2019 Community**

    ```
    node-gyp configure --msbuild_path="C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe" --msvs_version=2017
    node-gyp build
    ```

## Examples    
- examples/command-line

    ```
    node test.js -f test.tif
    ```
- examples/web

    ```
    npm install
    node server.js
    ```
    Open `http://localhost:2018/index.htm` in web browsers.

- examples/desktop-electron

    ```
    cd src
    node-gyp rebuild --target=0.36.7 --arch=x64 --dist-url=https://atom.io/download/atom-shell

    cd examples/desktop-electron
    npm install
    npm start
    ```

- examples/linux-camera

    ```
    npm install v4l2camera
    node camera_barcode_reader.js
    ```

- examples/RESTful-service

    ```
    npm install restify
    node server.js
    ```
    
    Open `https://< ip >:2018` to scan barcodes in web browsers.

## APIs
- initLicense(license-key)
- decodeFileAsync(fileName, barcodeTypes, callback, template)
- decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, callback, template)
- decodeBase64Async(base64, barcodeTypes, callback, template)
- decodeYUYVAsync(buffer, width, height, barcodeTypes, callback, template)
- decodeBufferAsync(buffer, width, height, stride, barcodeTypes, callback, template, maxBufferLength)

Template is an advanced usage. By default, you just need to set template "".

**barcodeTypes**

```js
barcodeTypes = dbr.formats.OneD | dbr.formats.PDF417 | dbr.formats.QRCode | dbr.formats.DataMatrix | dbr.formats.Aztec
```

**template**
```js
let params = {
  "ImageParameter": {
    "Name": "Custom_143301_827",
    "BarcodeFormatIds": [
      "BF_ALL"
    ],
    "DeblurLevel": 9,
    "ExpectedBarcodesCount": 100,
    "ScaleDownThreshold": 1200000,
    "Timeout": 100000
  },
  "Version": "3.0"
};
template = JSON.stringify(params);
```

