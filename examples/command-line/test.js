var dbr = require('../../index.js');
var barcodeTypes = dbr.formats.ALL;
var readline = require('readline');
var fs = require('fs');

let template = "";
// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
function decodeFileAsync(fileName) {
  dbr.decodeFileAsync(fileName, barcodeTypes, function (err, msg) {
    let result = null;
    for (index in msg) {
      result = msg[index];
      console.log('Format: ' + result['format']);
      console.log('Value : ' + result['value']);
      console.log('##################');
    }
  }, template);
}

function decodeFileStreamAsync(fileName) {
  let stats = fs.statSync(fileName);
  let fileSize = stats['size'];

  fs.open(fileName, 'r', function (status, fd) {
    if (status) {
      console.log(status.message);
      return;
    }
    let buffer = Buffer.alloc(fileSize);
    fs.read(fd, buffer, 0, fileSize, 0, function (err, bytesRead, data) {
      (async function () {
        try {
          var result = await dbr.decodeFileStreamAsync(buffer, fileSize, barcodeTypes, template);
          console.log(result);

          // dbr.destroyInstance();
          setTimeout(() => {
            console.log('terminated');
          }, 1000);
        } catch (error) {
          console.log(error);
        }
      })();
    });
  });
}

function decodeYUYVAsync(fileName, width, height) {
  let stats = fs.statSync(fileName);
  let fileSize = stats['size'];

  fs.open(fileName, 'r', function (status, fd) {
    if (status) {
      console.log(status.message);
      return;
    }
    let buffer = Buffer.alloc(fileSize);
    fs.read(fd, buffer, 0, fileSize, 0, function (err, bytesRead, data) {
      dbr.decodeYUYVAsync(
        buffer, width, height, barcodeTypes, function (err, msg) {
          let result = null;
          for (index in msg) {
            result = msg[index];
            console.log('Format: ' + result['format']);
            console.log('Value : ' + result['value']);
            console.log('##################');
          }
        }, template);
    });
  });
}

function decodeBase64Async(fileName) {
  fs.readFile(fileName, 'utf8', (err, data) => {
    dbr.decodeBase64Async(data, barcodeTypes, function (err, msg) {
      let result = null;
      for (index in msg) {
        result = msg[index];
        console.log('Format: ' + result['format']);
        console.log('Value : ' + result['value']);
        console.log('##################');
      }

    }, template);
  });
}

// https://stackoverflow.com/questions/2727167/how-do-you-get-a-list-of-the-names-of-all-files-present-in-a-directory-in-node-j
function getFiles(dir, files_) {
  files_ = files_ || [];
  let files = fs.readdirSync(dir);
  for (let i in files) {
    let name = dir + '/' + files[i];
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

let args = process.argv;
/**
 * Read a file: node test.js -f xxx.jpg
 * Read a folder: node test.js -d /mnt/folder
 */
if (args.includes('-f')) {
  // Read a file
  if (args.includes('-t')) {
    let tIndex = args.indexOf('-t');
    if (args[tIndex + 1]) {
      template = fs.readFileSync(args[tIndex + 1])
    }
    else {
      console.log('Please add a template file.');
      return;
    }
  }

  let fIndex = args.indexOf('-f');
  if (args[fIndex + 1]) {
    decodeFileStreamAsync(args[fIndex + 1]);
  } else {
    console.log('Please add a file.');
  }

} else if (args.includes('-d')) {
  // Read a folder
  let dIndex = args.indexOf('-d');
  if (args[dIndex + 1]) {
    let files = getFiles(args[dIndex + 1]);
    files.forEach(file => {
      if (file.endsWith('.jpg')) {
        decodeFileStreamAsync(file);
      }
    });
  } else {
    console.log('Please add a directory.')
  }
} else {
  let rl =
    readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question('Please input a barcode image path: ', function (answer) {
    // decodeFileStreamAsync(answer);
    // decodeFileAsync(answer);
    // decodeYUYVAsync(answer, 640, 480);
    (async function () {
      try {
        var result = await dbr.decodeFileAsync(answer, barcodeTypes, template);
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    })();
    rl.close();
  });
}