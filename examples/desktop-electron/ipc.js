'use strict';

const { ipcMain } = require('electron');

// barcode4nodejs decodes in worker threads, which are only available in the main
// process - so the renderer talks to the SDK through these IPC handlers.
const dbr = require('../../index.js');

// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
const LICENSE_KEY = process.env.DCV_LICENSE ||
  'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';

function register() {
  ipcMain.handle('dbr:initLicense', function () {
    return dbr.initLicense(LICENSE_KEY);
  });

  ipcMain.handle('dbr:decode', async function (_event, bytes, format) {
    const buffer = Buffer.from(bytes);
    return dbr.decodeFileStreamAsync(buffer, buffer.length, format, '');
  });
}

module.exports = { register };
