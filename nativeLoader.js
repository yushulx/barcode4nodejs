if (process.platform === 'win32') {
    console.log('Windows');
}
else if (process.platform === 'linux') {
    console.log('Linux');
}
else if (process.platform === 'darwin') {
    console.log('macOS');
}
else {
    console.log('Unknown Operating System');
}

let dbrInstance;
module.exports = function () {
    if (!dbrInstance) {
        dbrInstance = require('./build/Release/dbr');
    }
    return dbrInstance;
};