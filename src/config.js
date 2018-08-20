var license = '';

if (process.platform === 'win32') {
    console.log('Windows');
    license = 't0068NQAAAGWe/zXkYmggvyFrd8PmfjplKakH67Upt9HvuRDIBAV6MZ4uODuL1ZUgSEAOygejsfwj6XRKI5iD1tLKZBRGo2c=';
}
else if(process.platform === 'linux') {
    console.log('Linux');
    license = 't0068NQAAAIY/7KegDlZn7YiPdAj0cbA11n2CwuCEWnk2KYla55ozdfmoasjRIpHhl0EUZmko/zxfxFLH3FpLw694uihoCVM=';
}
else if(process.platform === 'darwin') {
    console.log('macOS');
    license = 't0068NQAAAIY/7KegDlZn7YiPdAj0cbA11n2CwuCEWnk2KYla55ozdfmoasjRIpHhl0EUZmko/zxfxFLH3FpLw694uihoCVM=';
}
else {
    console.log('Unknown Operating System');
}

var dbr = require('./build/Release/dbr');
var barcodeTypes = 0x3FF | 0x2000000 | 0x4000000 | 0x8000000 | 0x10000000;  // 1D, PDF417, QRCODE, DataMatrix, Aztec Code

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