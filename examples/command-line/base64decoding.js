var dbr = require('../../index.js');
var barcodeTypes = dbr.barcodeTypes;
var readline = require('readline');
var fs = require('fs');

// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense?product=dbr
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");

fs.readFile('base64.txt', 'utf8' , (err, data) => {

    dbr.decodeBase64Async(data, barcodeTypes, function (err, msg) {
        for (let index in msg) {
          var result = msg[index]
          console.log(result['format']);
          console.log(result['value']);
          console.log("##################");
        }
      }, "");
  });