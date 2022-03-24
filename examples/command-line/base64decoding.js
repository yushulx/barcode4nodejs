var dbr = require('../../index.js');
var barcodeTypes = dbr.barcodeTypes;
var readline = require('readline');
var fs = require('fs');

// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense?product=dbr
dbr.initLicense("LICENSE-KEY");

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