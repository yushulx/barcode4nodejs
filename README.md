# Node.js Barcode & QR Code SDK
The Node.js barcode QR code SDK is implemented by wrapping [Dynamsoft Barcode Reader C++ SDK](https://www.dynamsoft.com/barcode-reader/overview/). It helps developers to build Node.js barcode and QR code scanning applications for **Windows**, **Linux**, **macOS**, **Raspberry Pi** and **Jetson Nano**.

## Dynamsoft Barcode Reader SDK Version
[v9.6.20](https://www.dynamsoft.com/barcode-reader/downloads)

## License Key for SDK
[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dbr)


## Pre-requisites
- Platform-specific C/C++ compiler
- node-gyp

    ```
    npm i node-gyp -g
    ```

## Supported Platforms
- **Windows**
- **Linux**
- **macOS**

## Supported Barcode Symbologies
- Linear Barcodes (1D)
  - Code 39 (including Code 39 Extended)
  - Code 93
  - Code 128
  - Codabar
  - Interleaved 2 of 5
  - EAN-8
  - EAN-13
  - UPC-A
  - UPC-E
  - Industrial 2 of 5

- 2D Barcodes
  - QR Code (including Micro QR Code and Model 1)
  - Data Matrix
  - PDF417 (including Micro PDF417)
  - Aztec Code
  - MaxiCode (mode 2-5)
  - DotCode

- Patch Code
- GS1 Composite Code
- GS1 DataBar
  - Omnidirectional,
  - Truncated, Stacked, Stacked
  - Omnidirectional, Limited,
  - Expanded, Expanded Stacked

- Postal Codes
  - USPS Intelligent Mail
  - Postnet
  - Planet
  - Australian Post
  - UK Royal Mail

## API
- `initLicense(license-key)`
- `decodeFileAsync(fileName, barcodeTypes, callback, template)` or `await decodeFileAsync(fileName, barcodeTypes, template)`
- `decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, callback, template)` or `await decodeFileStreamAsync(fileStream, fileSize, barcodeTypes, template)`
- `decodeBase64Async(base64, barcodeTypes, callback, template)` or `await decodeBase64Async(base64, barcodeTypes, template)`
- `decodeYUYVAsync(buffer, width, height, barcodeTypes, callback, template)` or `await decodeYUYVAsync(buffer, width, height, barcodeTypes, template)`
- `decodeBufferAsync(buffer, width, height, stride, barcodeTypes, callback, template, maxBufferLength)` or `await decodeBufferAsync(buffer, width, height, stride, barcodeTypes, template, maxBufferLength)`

## Template Usage
1. Visit the [barcode reader online demo](https://demo.dynamsoft.com/barcode-reader/). 
2. Customize parameters in advanced settings and then download the template.

For example:

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

## Quick Usage

```js
const dbr = require('barcode4nodejs');
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==")
dbr.decodeFileAsync("YOUR IMAGE FILE", dbr.formats.OneD | dbr.formats.PDF417 | dbr.formats.QRCode | dbr.formats.DataMatrix | dbr.formats.Aztec, function(err, msg){
  console.log(msg);
  for (index in msg) {
    result = msg[index];
    console.log('Format: ' + result['format']);
    console.log('Value : ' + result['value']);
    console.log('x1: ' + result['x1']);
    console.log('y1 : ' + result['y1']);
    console.log('x2: ' + result['x2']);
    console.log('y2 : ' + result['y2']);
    console.log('x3: ' + result['x3']);
    console.log('y3: ' + result['y3']);
    console.log('x4: ' + result['x4']);
    console.log('y4: ' + result['y4']);
    console.log('decoding time: ' + result['time']);
  }
}, "");

// Or
(async function () {
  try {
    var result = await dbr.decodeFileAsync("YOUR IMAGE FILE", dbr.formats.OneD | dbr.formats.PDF417 | dbr.formats.QRCode | dbr.formats.DataMatrix | dbr.formats.Aztec, "");
    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
```

## How to Customize and Build the Module 

1. Get the source code:

    ```
    git clone https://github.com/yushulx/nodejs-barcode.git
    ``` 

2. Download Dynamsoft C++ Barcode SDK. Copy header files to `src` folder and copy platform-specific shared libraries to `platforms` folder.
3. Edit `src/dbr.cc` and `index.js`.
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



