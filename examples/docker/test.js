const dbr = require('barcode4nodejs');
// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense?product=dbr
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
dbr.decodeFileAsync("test.tif", dbr.formats.OneD | dbr.formats.PDF417 | dbr.formats.QRCode | dbr.formats.DataMatrix | dbr.formats.Aztec, function(err, msg){
  console.log(msg);
  for (index in msg) {
    result = msg[index];
    console.log('Format: ' + result['format']);
    console.log('Value : ' + result['value']);
    console.log('x1: ' + result['x1']);
    console.log('y1 : ' + result['y1']);
    console.log('x2: ' + result['x2']);
    console.log('y2 : ' + result['y2']);
    console.log('x3: ' + result['x3']);
    console.log('y3: ' + result['y3']);
    console.log('x4: ' + result['x4']);
    console.log('y4 : ' + result['y4']);
  }
}, "");