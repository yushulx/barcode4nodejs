var license = '';

if (process.platform === 'win32') {
    console.log('Windows');
    license = 't0068NQAAAFdeb4LWUdRVDmkg49LUtdiRPFIquQt7hDNyQLebOU5y7b9z4Is2mirRnansvZkWO9191n/va21Pmv+FzrmPKqs=';
}
else if(process.platform === 'linux') {
    console.log('Linux');
    license = 't0068NQAAAHSLeRGgQNNSj5KP8wyR7gqp3AHhmaB9JY4fMDis6J7Veox1d6OJwzJK+pBqRVRcgRhbH8v04cy+KZ6o28jthlw=';
}
else if(process.platform === 'darwin') {
    console.log('macOS');
    license = 't0068NQAAAI3tqjND/UCGIOC+tXsEWOlmfWLbx1lXZhAUkuOj2lSxBo6Y+cjk+qxg7zYOGrPvE+u/z3ByXJRReIvN2VGr55Y=';
}
else {
    console.log('Unknown Operating System');
}

var dbr = require('./build/Release/dbr');
var barcodeTypes = 0x3FF | 0x2000000 | 0x4000000 | 0x8000000;  // 1D, PDF417, QRCODE, DataMatrix

// Initialize DBR license.
// Please visit https://www.dynamsoft.com/CustomerPortal/Portal/Triallicense.aspx or contact support@dynamsoft.com to get a valid trial or full license.
dbr.initLicense(license);

module.exports = {
    decodeFileAsync: dbr.decodeFileAsync,
    decodeFileStreamAsync: dbr.decodeFileStreamAsync,
    decodeBase64Async: dbr.decodeBase64Async,
    decodeYUYVAsync: dbr.decodeYUYVAsync,
    barcodeTypes: barcodeTypes
};