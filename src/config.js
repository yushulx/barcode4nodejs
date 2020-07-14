var license = 'LICENSE-KEY';

if (process.platform === 'win32') {
    console.log('Windows');
}
else if(process.platform === 'linux') {
    console.log('Linux');
}
else if(process.platform === 'darwin') {
    console.log('macOS');
}
else {
    console.log('Unknown Operating System');
}

var dbr = require('./build/Release/dbr');
var formats = {
    'OneD': 0x000007FF,
    'PDF417': 0x02000000,
    'QRCode': 0x04000000,
    'DataMatrix': 0x08000000,
    'Aztec': 0x10000000
}

var barcodeTypes = formats.OneD | formats.PDF417 | formats.QRCode | formats.DataMatrix | formats.Aztec;  // 1D, PDF417, QRCODE, DataMatrix, Aztec Code

// Initialize DBR license.
// Please visit https://www.dynamsoft.com/CustomerPortal/Portal/Triallicense.aspx or contact support@dynamsoft.com to get a valid trial or full license.
dbr.initLicense(license);

module.exports = {
    decodeFileAsync: dbr.decodeFileAsync,
    decodeFileStreamAsync: dbr.decodeFileStreamAsync,
    decodeBase64Async: dbr.decodeBase64Async,
    decodeYUYVAsync: dbr.decodeYUYVAsync,
    formats: formats,
    initLicense: dbr.initLicense,
    barcodeTypes: barcodeTypes,
    setParameters: dbr.setParameters,
    decodeBufferAsync: dbr.decodeBufferAsync
};