'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dbr', {
  initLicense: function () {
    return ipcRenderer.invoke('dbr:initLicense');
  },
  decode: function (bytes, format) {
    return ipcRenderer.invoke('dbr:decode', bytes, format);
  }
});
