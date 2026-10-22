// http://restify.com/
var restify = require('restify');
var fs = require('fs');
var server = restify.createServer({
  certificate: fs.readFileSync('key-cert.pem'),
  key: fs.readFileSync('key.pem'),
  name: 'MyApp',
});

var dbr = require('../../index.js');
// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
var barcodeTypes = dbr.barcodeTypes;

// restify 4 exposes these helpers on the root object, restify 5+ moved them to `plugins`.
var bodyParser = restify.plugins && restify.plugins.bodyParser ? restify.plugins.bodyParser() : restify.bodyParser();
var serveStatic = restify.plugins && restify.plugins.serveStatic ? restify.plugins.serveStatic : restify.serveStatic;
var staticHandler = serveStatic({
  directory: __dirname,
  default: 'index.html'
});

server.use(bodyParser);

// restify 11 no longer accepts a RegExp route, use wildcard paths instead.
server.get('/', staticHandler);
server.get('/.*', staticHandler);

server.post('/dbr', function create(req, res, next) {
  // console.log(req.body);
  // fs.writeFile("log.txt", req.body, function (err) {
  //   if (err) {
  //     return console.log(err);
  //   }

  //   console.log("Base64 saved!");
  // });

  // var data = new Buffer(req.body, 'base64');
  // var file = __dirname + '/' + new Date().getTime() + '.png';
  // var file = __dirname + '/' + 'test.png';

  // fs.writeFile(file, data, function (err) {
  //   dbr.decodeFileAsync(file, barcodeTypes, function (err, msg) {
  //     fs.unlink(file, function (err) {
  //       console.log('Removed cached: ' + file);
  //     });

  //     var final_result = "";
  //     var hasResult = false;
  //     for (index in msg) {
  //       hasResult = true;
  //       var result = msg[index]
  //       final_result += "value: " + result['value'] + "; ";
  //       console.log(result['format']);
  //       console.log(result['value']);
  //       console.log("##################");
  //     }

  //     if (!hasResult) {
  //       final_result = "No barcode detected. ";
  //     }

  //     final_result += new Date();

  //     res.send(200, final_result);
  //     next();
  //   }, "");
  // });
  // let image = str(req.body);
  // console.log(image);
  let data = Buffer.from(req.body);
  dbr.decodeBase64Async(data.toString('utf8'), barcodeTypes, function (err, msg) {
    // fs.unlink(file, function (err) {
    //   console.log('Removed cached: ' + file);
    // });
    var final_result = "";
    var hasResult = false;
    for (let index in msg) {
      hasResult = true;
      var result = msg[index]
      final_result += result['value'] + "; ";
      console.log(result['format']);
      console.log(result['value']);
      console.log("##################");
    }

    if (!hasResult) {
      final_result = "No barcode detected. ";
    }

    final_result += new Date();

    res.send(200, final_result);
    next();
  }, "");
});

server.listen(2018, function () {
  console.log('REST server listening at %s', server.url);
});
