var dbr = require('../../index.js');
var barcodeTypes = dbr.barcodeTypes;
var readline = require('readline');
var fs = require('fs');

ret = dbr.initLicense('t0068MgAAABFQA39jYCWHtte4UvAS5+TiD6ciBPjNkepWU2aIc2gw9U4UmCoI1RnRWYLYfDr7gngpEmrjUZ3/+WVtSQ6iJNc=');

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