# Real-time Barcode and QR Code Scanning with Node.js and OpenCV
Build simple Node.js barcode reader applications for both desktop and web using [barcode4nodejs](https://www.npmjs.com/package/barcode4nodejs) and [opencv4nodejs](https://www.npmjs.com/package/opencv4nodejs).


## Prequisites
- [Dynamsoft Barcode Reader Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)
- [Node.js](https://nodejs.org/en/download/)
- [OpenCV](https://opencv.org/releases/)
    
    For Windows, you must configure the following environment variables before installing the `opencv4nodejs` package:
    
    - `OPENCV_INCLUDE_DIR`: Points to the directory containing the `opencv2` subfolder with header files.
    - `OPENCV_LIB_DIR`: Points to the library directory containing the OpenCV `.lib` files.

## Installation

```bash
npm install opencv4nodejs barcode4nodejs
```

## Usage
Set the license key in the `desktop.js` and `web.js` files:

```js
dbr.initLicense("LICENSE-KEY")
```

### Desktop App
Run the desktop barcode and QR code scanning app with:

```
node desktop.js
```

![desktop barcode and QR code reader](https://www.dynamsoft.com/codepool/wp-content/uploads/2020/07/nodejs-barcode-opencv-webcam.png)

### Web App
To scan barcodes and QR codes in any web browser, start the web server and then navigate to `localhost:2024`:

```
node web.js
```

![reading barcode and QR code in Microsoft Internet Explorer](https://www.dynamsoft.com/codepool/wp-content/uploads/2020/07/opencv-nodejs-barcode-web.png)

## Q&A
You may encounter the following error when running the code on Windows, even if the `opencv4nodejs.node` file has been successfully built:

```bash
node:internal/modules/cjs/loader:1275
  return process.dlopen(module, path.toNamespacedPath(filename));
                 ^

Error: The specified module could not be found.
\\?\D:\code\nodejs-barcode\examples\opencv\node_modules\opencv4nodejs\build\Release\opencv4nodejs.node
    at Object.Module._extensions..node (node:internal/modules/cjs/loader:1275:18)
    at Module.load (node:internal/modules/cjs/loader:1069:32)
    at Function.Module._load (node:internal/modules/cjs/loader:904:12)
    at Module.require (node:internal/modules/cjs/loader:1093:19)
    at require (node:internal/modules/cjs/helpers:108:18)
    at Object.<anonymous> (D:\code\nodejs-barcode\examples\opencv\node_modules\opencv4nodejs\lib\cv.js:58:8)
    at Module._compile (node:internal/modules/cjs/loader:1191:14)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1245:10)
    at Module.load (node:internal/modules/cjs/loader:1069:32)
    at Function.Module._load (node:internal/modules/cjs/loader:904:12) {
  code: 'ERR_DLOPEN_FAILED'
}
```

To resolve this issue, check the dependencies of `opencv4nodejs.node` with `dumpbin`:

```bash
dumpbin /dependents node_modules\opencv4nodejs\build\Release\opencv4nodejs.node
```

![opencv4nodejs dependency](https://www.dynamsoft.com/codepool/img/2024/04/opencv4nodejs-dependency.jpg)

Then copy the missing DLL, `opencv_world410.dll`, to the directory where `opencv4nodejs.node` is located.
