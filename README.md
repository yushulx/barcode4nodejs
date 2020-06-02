# DBR Node.js Extension

Version 7.2

The repository aims to help developers build **Node.js barcode** apps with [Dynamsoft Barcode Reader](https://www.dynamsoft.com/Products/Dynamic-Barcode-Reader.aspx) in Windows, Linux, macOS, and Raspberry Pi.

## License
Get the [trial license](https://www.dynamsoft.com/CustomerPortal/Portal/Triallicense.aspx).

## Contact Us
<support@dynamsoft.com>

## Environment
**Node v8.11.3**

## Installation
* [Dynamsoft Barcode Reader SDK v7.2](https://github.com/dynamsoft-dbr/nodejs/releases/tag/v7.2).
* node-gyp

    ```
    npm i node-gyp -g
    ```

## How to Build
### Windows
Change directory to **src**.
```
cd src
```

Edit `binding.gyp`. Replace `c:\\Program Files (x86)\\Dynamsoft\\Barcode Reader 7.2\\Components\\C_C++\\Lib\\DBRx64.lib` and `c:\\Program Files (x86)\\Dynamsoft\\Barcode Reader 7.2\\Components\\C_C++\\Redist\\x64\\` with yours.

Build the Node.js extension:

```
node-gyp configure
node-gyp build
```

**For Visual Studio 2019 Community**

```
node-gyp configure --msbuild_path="C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe" --msvs_version=2017
node-gyp build
```

### Linux, macOS and Raspberry Pi
Change directory to **src**.
```
cd src
```

Edit `binding.gyp`. Replace `/mnt/g/nodejs/libDynamsoftBarcodeReader.so` and `/mnt/g/nodejs` or `/mnt/g/nodejs/libDynamsoftBarcodeReader.dylib` and `/mnt/g/nodejs` with yours.

Build the Node.js extension:

```
node-gyp configure
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

## Template Settings
https://www.dynamsoft.com/help/Barcode-Reader/devguide/Template/TemplateSettingsList.html

## How to Set Barcode Types

The simplest way to set barcode types:

```javascript
var barcodeTypes = dbr.formats.OneD;
decodeFileAsync(fileName, barcodeTypes, callback);
```

Alternatively, you can use template:

```javascript
// From file
template = fs.readFileSync("<template file>");

// From JSON object
let params = {
    "Version": "2.0",
    "ImageParameter": {
      "Name": "Custom_143301_827",
      "BarcodeFormatIds": [
        "PDF417"
      ],
      "ExpectedBarcodesCount": 9,
      "ScaleDownThreshold": 1200000,
      "BinarizationBlockSize": 5
    }
  };
template = JSON.stringify(params);

decodeFileAsync(fileName, 0, callback, template);
```


## Related Articles
* [How to Wrap Dynamsoft Linux Barcode SDK for Node.js](https://www.codepool.biz/linux-barcode-sdk-node-javascript.html)
* [How to Build Node.js Barcode Reader on Raspberry Pi](https://www.codepool.biz/raspberry-pi-nodejs-barcode-reader.html)
* [Node.js Barcode Scanner with UVC Camera for Raspberry Pi](https://www.codepool.biz/nodejs-barcode-scanner-camera-raspberrypi.html)
* [How to Make Node Barcode Reader Addon on Linux](https://www.codepool.biz/linux-node-barcode-reader-addon.html)
* [Making Online Barcode Reader on Linux with Node.js](https://www.codepool.biz/nodejs-linux-online-barcode-reader.html)
* [Making Dynamsoft Barcode SDK an Addon for Node.js](https://www.codepool.biz/making-barcode-addon-for-nodejs.html)
* [How to Make Web Barcode Reader with NodeJS REST Framework](https://www.codepool.biz/web-barcode-reader-nodejs-rest.html)

