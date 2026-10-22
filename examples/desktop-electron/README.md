# Native Desktop Barcode Reader

A desktop barcode reader built with [Electron](https://www.electronjs.org/) and `barcode4nodejs`.

## Files

- `index.htm` - the UI (pick an image, choose barcode types, read).
- `main.js` - creates the window.
- `preload.js` - exposes the barcode API to the page through `contextBridge`.
- `ipc.js` - runs the SDK in the main process and answers IPC calls.
- `test.js` - headless end-to-end check.

## Getting Started

1. Install dependencies:

    ```
    npm install
    ```

2. Start the application:

    ```
    npm start
    ```

3. Run the headless check (decodes `../../images/test.tif`):

    ```
    npm test
    # or a specific image
    npm test -- ../command-line/test.tif
    ```

## Why the SDK runs in the main process

`barcode4nodejs` decodes in worker threads. Worker threads are not available in an Electron renderer
process, so the page talks to the SDK through IPC: `index.htm` -> `preload.js` -> `ipc.js` ->
`barcode4nodejs`. This also keeps decoding off the UI thread.

> Since `barcode4nodejs` 11.0.0 the module is pure JavaScript. There is no `dbr.node` addon to rebuild
> against the Electron ABI anymore, so the old `node-gyp rebuild --target=...` step is gone.

## License

Set `DCV_LICENSE` in the environment to use your own key, otherwise the trial key in `ipc.js` is used.

[Get a 30-day trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)
