# Node.js Barcode & QR Code SDK
The Node.js barcode QR code SDK is implemented by wrapping [Dynamsoft Barcode Reader C++ SDK](https://www.dynamsoft.com/barcode-reader/overview/). It helps developers to build Node.js barcode and QR code scanning applications for **Windows**, **Linux**, **macOS**, **Raspberry Pi** and **Jetson Nano**.

## Dynamsoft Barcode Reader SDK Version
**v9.6.40**

## License Key for SDK
[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)


## Pre-requisites
- Platform-specific C/C++ compiler
- node-gyp

    ```
    npm i node-gyp -g
    npm i node-addon-api -g
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
- `initLicense(license: string): void`
- `createInstance(readerType: readerTypes): BarcodeReader`
- `getVersion(): string`

**Asynchronous Methods**
- `decodeFileAsync(filePath: string, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void`
- `decodeFileAsync(filePath: string, format: formats, template?: string): Promise<BarcodeResult[]>`
- `decodeFileStreamAsync(stream: any, length: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void`
- `decodeFileStreamAsync(stream: any, length: number, format: formats, template?: string): Promise<BarcodeResult[]>`
- `decodeBase64Async(base64String: string, format: formats, callback: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void`
- `decodeBase64Async(base64String: string, format: formats, template?: string): Promise<BarcodeResult[]>`
- `decodeYUYVAsync(data: any, width: number, height: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void`
- `decodeYUYVAsync(data: any, width: number, height: number, format: formats, template?: string): Promise<BarcodeResult[]>`
- `decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, callback?: (err: Error | null, result?: BarcodeResult[]) => void, template?: string): void`
- `decodeBufferAsync(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): Promise<BarcodeResult[]>`

**Synchronous Methods**
- `decodeFile(filePath: string, format: formats, template?: string): BarcodeResult[]`
- `decodeFileStream(stream: any, length: number, format: formats, template?: string): BarcodeResult[]`
- `decodeBase64(base64String: string, format: formats, template?: string): BarcodeResult[]`
- `decodeYUYV(data: any, width: number, height: number, format: formats, template?: string): BarcodeResult[]`
- `decodeBuffer(buffer: any, width: number, height: number, stride: number, format: formats, template?: string): BarcodeResult[]`

## Template Usage
1. Visit the [barcode reader online demo](https://demo.dynamsoft.com/barcode-reader-v9/). 
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
Replace `LICENSE-KEY` with your own license key.

```js
const dbr = require('barcode4nodejs');
dbr.initLicense("LICENSE-KEY")
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
    console.log('page: ' + result['page']);
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
- [Command Line](./examples/command-line/)

    ```
    node test.js -f MultiPage.pdf
    ```

    ![image](https://github.com/yushulx/nodejs-barcode/assets/2202306/897ab95a-6d94-4e58-9a3f-ab040ea48240)

    
- [Web](./examples/web/)

    ```
    npm install
    node server.js
    ```
    Open `http://localhost:2018/index.htm` in web browsers.

- [Desktop Electron](./examples/desktop-electron/)

    ```
    cd src
    node-gyp rebuild --target=0.36.7 --arch=x64 --dist-url=https://atom.io/download/atom-shell

    cd examples/desktop-electron
    npm install
    npm start
    ```

- [Linux Camera](./examples/linux-camera/)

    ```
    npm install v4l2camera
    node camera_barcode_reader.js
    ```

- [RESTful Service](./examples/RESTful-service/)

    ```
    npm install restify
    node server.js
    ```
    
    Open `https://< ip >:2018` to scan barcodes in web browsers.

- [OpenCV](./examples/opencv/)
- [Node-RED](./examples/node-red/)

    ![Node RED barcode](https://www.dynamsoft.com/codepool/img/2018/11/node-red-debug.PNG)
