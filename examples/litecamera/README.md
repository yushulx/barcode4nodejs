# Real-time Barcode and QR Code Scanning with Node.js
Build simple Node.js barcode reader applications for both desktop and web using [barcode4nodejs](https://www.npmjs.com/package/barcode4nodejs) and [litecam](https://www.npmjs.com/package/litecam).


## Prequisites
- [Dynamsoft Barcode Reader Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)
- [Node.js](https://nodejs.org/en/download/)

## Installation

```bash
npm install litecam barcode4nodejs
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

![desktop barcode and QR code reader](https://www.dynamsoft.com/codepool/img/2025/01/nodejs-multi-barcode-scanner.png)

### Web App
To scan barcodes and QR codes in any web browser, start the web server and then navigate to `localhost:2024`:

```
node web.js
```

![reading barcode and QR code in Microsoft Internet Explorer](https://www.dynamsoft.com/codepool/img/2025/01/nodejs-multi-barcode-scanner-web.jpg)

