# Native Desktop Barcode Reader

The sample demonstrates how to create a native desktop barcode reader based on [Electron](http://electron.atom.io/docs/latest/tutorial/quick-start).

A basic Electron application needs just these files:

- `index.htm` - A web page to render.
- `main.js` - Starts the app and creates a browser window to render HTML.
- `package.json` - Points to the app's main file and lists its details and dependencies.

## Getting Started

1. Rebuild [dbr.node/dbr.so](https://github.com/yushulx/nodejs-barcode-for-win-linux-mac):

    ```
    # check electron version
    electron –v
    # rebuild the native node module
    node-gyp rebuild --target=0.36.7 --arch=x64 --dist-url=https://atom.io/download/atom-shell
    ```
2. Install dependencies:

    ```
    npm install
    ```
3. Start the application:

    ```
    npm start
    ```

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

## Blog
[How to Build Cross-platform Desktop Barcode App with Electron](http://www.codepool.biz/cross-platform-desktop-barcode-electron.html)
