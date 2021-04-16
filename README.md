# DBR Node.js Extension

The project aims to help developers build **Node.js barcode** apps with [Dynamsoft Barcode Reader](https://www.dynamsoft.com/barcode-reader/overview/) in Windows, Linux, macOS, and Raspberry Pi.

## Barcode SDK License Key
Get the [trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dbr).

## Contact Us
<support@dynamsoft.com>

## Environment
**Node v12.14.0**

## Installation
* [Dynamsoft Barcode Reader SDK v7.4](https://www.dynamsoft.com/barcode-reader/downloads).
* node-gyp

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

## How to Build the Module for Windows, Linux, macOS and Raspberry Pi
Replace the library files in `platforms/` with yours.

Build the Node.js extension:

```
node-gyp configure
node-gyp build
```

### For Raspberry Pi
Download and extract the Raspberry Pi package, and then copy the `libDynamsoftBarcodeReader.so` file to the `platforms/linux` folder.

### For Visual Studio 2019 Community

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


## Related Articles
* [How to Wrap Dynamsoft Linux Barcode SDK for Node.js](https://www.codepool.biz/linux-barcode-sdk-node-javascript.html)
* [How to Build Node.js Barcode Reader on Raspberry Pi](https://www.codepool.biz/raspberry-pi-nodejs-barcode-reader.html)
* [Node.js Barcode Scanner with UVC Camera for Raspberry Pi](https://www.codepool.biz/nodejs-barcode-scanner-camera-raspberrypi.html)
* [How to Make Node Barcode Reader Addon on Linux](https://www.codepool.biz/linux-node-barcode-reader-addon.html)
* [Making Online Barcode Reader on Linux with Node.js](https://www.codepool.biz/nodejs-linux-online-barcode-reader.html)
* [Making Dynamsoft Barcode SDK an Addon for Node.js](https://www.codepool.biz/making-barcode-addon-for-nodejs.html)
* [How to Make Web Barcode Reader with NodeJS REST Framework](https://www.codepool.biz/web-barcode-reader-nodejs-rest.html)

