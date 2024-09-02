module.exports = function (RED) {
  var dbr = require('barcode4nodejs');
  var barcodeTypes = dbr.formats.ALL;
  function BarcodeNode(config) {
    RED.nodes.createNode(this, config);
    this.license = config.license;
    this.template = config.template;
    var node = this;
    node.on('input', function (msg) {
      // node.log('msg: ' + JSON.stringify(msg));
      if (msg.filename && msg.filename.indexOf('base64') > -1) {
        var fs = require('fs');

        // Get a license key from https://www.dynamsoft.com/customer/license/trialLicense?product=dbr
        dbr.initLicense(node.license);
        fs.readFile(msg.filename, 'utf8', (err, data) => {

          dbr.decodeBase64Async(data, barcodeTypes, function (err, results) {
            msg.payload = results;
            node.send(msg);
          }, node.template);
        });
      }
      else if (msg.filename) {
        dbr.initLicense(node.license);
        dbr.decodeFileAsync(msg.filename, barcodeTypes, function (err, results) {
          msg.payload = results;
          node.send(msg);
        }, node.template);
      }
      else {
        msg.payload = msg.payload.toLowerCase();
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType('barcode', BarcodeNode);
}