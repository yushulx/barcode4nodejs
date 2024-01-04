var exec = require('child_process').exec;
var os = require('os');

function puts(error, stdout, stderr) { console.error(error) }

const commands_linux = []

const commands_darwin = [
    "install_name_tool -change @rpath/libDynamsoftBarcodeReader.dylib @loader_path/libDynamsoftBarcodeReader.dylib build/Release/dbr.node"
]

const commands_windows = []

// Run command depending on the OS
if (os.type() === 'Linux') {
    if(commands_linux.length > 0) exec(commands_linux.join('&&'), puts);
} else if (os.type() === 'Darwin') {
    if(commands_darwin.length > 0) exec(commands_darwin.join('&&'), puts);
} else if (os.type() === 'Windows_NT') {
    if(commands_windows.length > 0) exec(commands_windows.join('&&'), puts);
}

