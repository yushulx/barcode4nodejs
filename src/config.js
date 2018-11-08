var license = '';

if (process.platform === 'win32') {
    console.log('Windows');
    license = 't0068NQAAACqUjZa21C+W7fRdPkf2FRFRr+QpfVC2tDsl/8t25TzYCNxl5s0OkuwFgEMGNfN95Z0HYQ55ROi1px9JqVAP7/c=';
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
var formats = {
    'OneD': 0x3FF,
    'PDF417': 0x2000000,
    'QRCode': 0x4000000,
    'DataMatrix': 0x8000000,
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
    barcodeTypes: barcodeTypes
};