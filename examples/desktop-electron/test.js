'use strict';

/**
 * Headless end-to-end check for the Electron example.
 *
 *   npm test            # decodes ../../images/test.tif
 *   npm test -- <file>  # decodes any other image
 *
 * It loads index.htm in a hidden window, feeds a real image through the same
 * `doReadBarcode()` code path the UI button uses, and prints the result.
 */

const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow } = require('electron');

require('./ipc.js').register();

// CI machines / VMs usually have no usable GPU.
app.disableHardwareAcceleration();

// Chromium switches (e.g. --no-sandbox) also land in process.argv, so only pick
// the first argument that looks like an image path.
const cliArgs = process.argv.slice(1).filter(function (arg) {
  return arg.charAt(0) !== '-' && !arg.endsWith('.js');
});
const imagePath = path.resolve(cliArgs[0] || path.join(__dirname, '..', '..', 'images', 'test.tif'));

function fail(message) {
  console.error('[e2e] FAIL: ' + message);
  process.exitCode = 1;
  app.quit();
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.on('did-fail-load', (_event, code, description) => {
    fail('page failed to load (' + code + '): ' + description);
  });

  try {
    await win.loadFile(path.join(__dirname, 'index.htm'));

    const base64 = fs.readFileSync(imagePath).toString('base64');
    const script = `
      (async () => {
        const binary = atob(${JSON.stringify(base64)});
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const fakeFile = {
          name: ${JSON.stringify(path.basename(imagePath))},
          arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
        };
        Object.defineProperty(document.getElementById('fileToUpload'), 'files', {
          value: [fakeFile],
          configurable: true
        });

        await doReadBarcode();
        return document.getElementById('resultBox').innerText;
      })()
    `;

    const text = await win.webContents.executeJavaScript(script);
    const count = (/Totol count:\s*(\d+)/.exec(text) || [])[1];

    console.log('[e2e] result: ' + text.replace(/\s+/g, ' ').trim());
    if (count === undefined) {
      fail('unexpected output, no barcode count found');
    } else if (Number(count) === 0) {
      fail('no barcode decoded');
    } else {
      console.log('[e2e] PASS: decoded ' + count + ' barcode(s) from ' + path.basename(imagePath));
      app.quit();
    }
  } catch (err) {
    fail(err && err.message ? err.message : String(err));
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
