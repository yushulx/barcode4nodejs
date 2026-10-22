# Node.js Barcode & QR Code SDK

`barcode4nodejs` is a Node.js barcode and QR code SDK. It exposes the familiar Dynamsoft Barcode Reader
API (`initLicense`, `decodeFileAsync`, `formats`, ...) on top of
[dynamsoft-capture-vision-for-node](https://www.npmjs.com/package/dynamsoft-capture-vision-for-node),
which means:

- **No native build step.** No `node-gyp`, no C++ compiler, no prebuilt `.node` binaries. `npm install` just works.
- **Always the latest Dynamsoft Barcode Reader engine.** The engine ships as a regular npm dependency, so
  `npm update` keeps it current.
- **Unchanged JavaScript API.** Existing `barcode4nodejs` code keeps working without modification.

```js
const dbr = require('barcode4nodejs');

dbr.initLicense('LICENSE-KEY');

const results = await dbr.decodeFileAsync('sample.png', dbr.formats.ALL);
console.log(results[0].format, results[0].value);
```

## License Key

[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

A license key is required to decode barcodes. Call `initLicense()` once, before the first decode.

```js
dbr.initLicense('DLS2eyJoYW5kc2hha2VDb2RlIjoi...');
```

## Installation

```bash
npm install barcode4nodejs
```

Requirements:

- Node.js >= 16
- One of the supported platforms (see below). The platform specific native library is pulled in
  automatically as an optional dependency of `dynamsoft-capture-vision-for-node`.

## Supported Platforms

| OS | Architectures |
|---|---|
| Windows | x64, x86 |
| Linux | x64 (glibc >= 2.18), arm64 |
| macOS | x64, arm64 (universal) |

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
  - MSI Code, Code 11, Matrix 2 of 5
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
  - Omnidirectional, Truncated, Stacked, Stacked Omnidirectional, Limited, Expanded, Expanded Stacked
- Postal Codes
  - USPS Intelligent Mail, Postnet, Planet, Australian Post, UK Royal Mail, KIX
- Pharmacode

## API

- `initLicense(license: string): number`
- `createInstance(): BarcodeReader`
- `getVersion(): string`
- `setLicenseCachePath(path: string): number`
- `destroyInstance(): void`

**Constants**

- `formats` — bit mask constants: `ALL`, `ONED`, `QR_CODE`, `CODE_128`, `PDF417`, ...
- `barcodeTypes` — defaults to `formats.ALL`

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

Every method accepts either a Node.js style callback or returns a `Promise` when the callback is omitted.

**Result object**

```ts
{
  format: string,      // "QR_CODE", "CODE_128", ...
  value: string,       // decoded text
  x1, y1, x2, y2, x3, y3, x4, y4: number,  // bounding quadrilateral, clockwise
  page: number,        // 0-based page index for PDF / TIFF input
  time: number,        // decoding time in milliseconds
  angle: number,       // barcode rotation angle
  isMirrored: number   // 1 if the barcode is mirrored, otherwise 0
}
```

## Quick Usage

Replace `LICENSE-KEY` with your own license key.

```js
const dbr = require('barcode4nodejs');

dbr.initLicense('LICENSE-KEY');

dbr.decodeFileAsync('YOUR IMAGE FILE', dbr.formats.ALL, function (err, msg) {
  if (err) {
    console.error(err);
    return;
  }
  for (const result of msg) {
    console.log('Format: ' + result.format);
    console.log('Value : ' + result.value);
    console.log('x1: ' + result.x1 + ' y1: ' + result.y1);
    console.log('x2: ' + result.x2 + ' y2: ' + result.y2);
    console.log('x3: ' + result.x3 + ' y3: ' + result.y3);
    console.log('x4: ' + result.x4 + ' y4: ' + result.y4);
    console.log('page: ' + result.page);
    console.log('decoding time: ' + result.time);
  }
}, '');

// Or
(async function () {
  try {
    const result = await dbr.decodeFileAsync('YOUR IMAGE FILE', dbr.formats.ALL, '');
    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
```

Restrict the symbologies that are decoded:

```js
const results = await dbr.decodeFileAsync('sample.png', dbr.formats.QR_CODE | dbr.formats.CODE_128);
```

Decode PDF / TIFF page by page — every page is returned, `page` tells you where a barcode was found:

```js
const results = await dbr.decodeFileAsync('multi-page.pdf', dbr.formats.ALL);
```

Decode raw pixel data (for example a frame from a camera):

```js
// RGB, 3 bytes per pixel
await dbr.decodeBufferAsync(rgbBuffer, width, height, width * 3, dbr.formats.ALL);

// YUYV (YUY2), 2 bytes per pixel
await dbr.decodeYUYVAsync(yuyvBuffer, width, height, dbr.formats.ALL);
```

## Custom Templates

The `template` argument is optional and accepts a JSON string, a parsed object, a `Buffer`, or a path to a
JSON file. When a template is supplied the `format` argument is ignored — exactly like previous versions of
this package.

Templates use the Dynamsoft Capture Vision schema. The safest way to build one is to start from the built-in
settings and change what you need:

```js
const { CaptureVisionRouter } = require('dynamsoft-capture-vision-for-node');

const settings = CaptureVisionRouter.outputSettings();
settings.BarcodeReaderTaskSettingOptions.forEach((task) => {
  if (task.Name === 'task-read-barcodes') {
    task.BarcodeFormatIds = ['BF_QR_CODE'];
    task.ExpectedBarcodesCount = 1;
  }
});

const results = await dbr.decodeFileAsync('sample.png', dbr.formats.ALL, JSON.stringify(settings));
```

Print the whole document to see every option that is available:

```js
console.log(JSON.stringify(CaptureVisionRouter.outputSettings(), null, 2));
```

> A hand written minimal template must define a consistent `CaptureVisionTemplates` → `TargetROIDefOptions`
> → `BarcodeReaderTaskSettingOptions` chain, otherwise the engine rejects it (`-10077` / `-10078`).

> **Legacy templates (Dynamsoft Barcode Reader 9.x / 10.x, `ImageParameter` schema) are still accepted, but
> only `ImageParameter.BarcodeFormatIds` is carried over.** The old schema is not understood by the current
> Capture Vision engine, so the remaining options (`DeblurLevel`, `ScaleDownThreshold`, ...) are dropped.


## Behaviour Notes

- **Errors are reported.** Failures (invalid license, unreadable file, invalid template) reject the promise or
  call the callback with an `Error`. Older versions silently resolved with an empty array.
- **`getVersion()`** returns the version of the Capture Vision SDK, e.g.
  `js:3.6.4002.20261019;cpp:3.6.40.9167`.
- **Decoding runs in worker threads** managed by the SDK, so it never blocks the event loop. The worker pool is
  kept warm between calls and shut down automatically shortly after the last decode, which lets short-lived
  scripts exit on their own. `destroyInstance()` shuts it down immediately.
- **`createInstance()`** returns an object with the same methods as the module. The decoding engine keeps its
  configuration process-wide, so instances share the underlying SDK settings.

## Examples

- [Command Line](./examples/command-line/)

    ```
    node examples/command-line/test.js -f examples/command-line/test.tif
    ```

- [Official command-line example (raw Capture Vision API)](./examples/official/command-line/)

- [Web](./examples/web/)

    ```
    npm install
    node server.js
    ```

    Open `http://localhost:2024/index.html` in a web browser.

- [RESTful Service](./examples/RESTful-service/)

    ```
    npm install
    node server.js
    ```

    The service listens on `https://localhost:2018` with the bundled self-signed certificate.

- [Litecamera](./examples/litecamera/)

    Requires the `litecam` native camera module and a physical camera.

## Testing

```bash
# images/test.tif is bundled with the repository
DCV_LICENSE=YOUR-LICENSE-KEY npm test
```

## License

MIT
