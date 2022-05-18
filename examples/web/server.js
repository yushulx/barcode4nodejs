var formidable = require('formidable');
var util = require('util');
var express = require('express');
var fs = require('fs');
var app = express();
var path = require('path');
var http = require('http');

var dbr = require('../../index.js');
// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense?product=dbr
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
var barcodeTypes = dbr.barcodeTypes;

function decodeBarcode(res, fileName, barcodeType) {
    // read barcode using dbr
    dbr.decodeFileAsync(fileName, barcodeType, function(err, msg) {
            var response = 'Totol count: ' + msg.length;
            var result = null;
            for (let index in msg) {
                result = msg[index]
                response += '<p>' + result['format'] + ': ';
                response += result['value'] + '<p>';
            }
            res.send(response);
        }, "");
}

app.use(express.static(__dirname));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, content-type");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var dir = 'uploads';

        fs.mkdir(dir, function (err) {
            var flag = fields.uploadFlag;
            var barcodeType = parseInt(fields.barcodetype);

            console.log('flag: ' + flag);

            if (flag === '1') {
                // read barcode image file
                fs
                    .readFile(files.fileToUpload.path, function (err, data) {
                        // save file from temp dir to new dir
                        var fileName = path.join(__dirname, dir, files.fileToUpload.name);
                        console.log(fileName);
                        fs.writeFile(fileName, data, function (err) {
                            if (err) 
                                throw err;
                            
                            decodeBarcode(res, fileName, barcodeType);
                        });
                    });

            } else { // read barcode image url
                var tmpFileName = path.join(__dirname, dir, 'tmp.jpg');
                var tmp = fs.createWriteStream(tmpFileName);
                var url = fields.fileToDownload;
                console.log('url: ' + url);
                try {
                    http.get(url, function (response) {
                        response.pipe(tmp);
                        tmp.on('finish', function () {
                            tmp
                                .close(function () {
                                    decodeBarcode(res, tmpFileName, barcodeType);
                                });
                        });
                    });
                } catch (error) {
                    console.log(error);
                    res.send('Invalid image!');
                }
                
            }
        });

    });
});

var server = app.listen(2018, function () {
    var host = server
        .address()
        .address;
    var port = server
        .address()
        .port;
    console.log('listening at http://%s:%s', host, port);
});