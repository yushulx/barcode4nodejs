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

var dbr = require('./build/Release/dbr');
var barcodeReader = null;
var formats = {
    ALL: 0xFE3FFFFF,
    ONED: 0x003007FF,
    GS1_DATABAR: 0x0003F800,
    CODE_39: 0x1,
    CODE_128: 0x2,
    CODE_93: 0x4,
    CODABAR: 0x8,
    ITF: 0x10,
    EAN_13: 0x20,
    EAN_8: 0x40,
    UPC_A: 0x80,
    UPC_E: 0x100,
    INDUSTRIAL_25: 0x200,
    CODE_39_EXTENDED: 0x400,
    GS1_DATABAR_OMNIDIRECTIONAL: 0x800,
    GS1_DATABAR_TRUNCATED: 0x1000,
    GS1_DATABAR_STACKED: 0x2000,
    GS1_DATABAR_STACKED_OMNIDIRECTIONAL: 0x4000,
    GS1_DATABAR_EXPANDED: 0x8000,
    GS1_DATABAR_EXPANDED_STACKED: 0x10000,
    GS1_DATABAR_LIMITED: 0x20000,
    PATCHCODE: 0x00040000,
    PDF417: 0x02000000,
    QR_CODE: 0x04000000,
    DATAMATRIX: 0x08000000,
    AZTEC: 0x10000000,
    MAXICODE: 0x20000000,
    MICRO_QR: 0x40000000,
    MICRO_PDF417: 0x00080000,
    GS1_COMPOSITE: 0x80000000,
    MSI_CODE: 0x100000,
    CODE_11: 0x200000
};

var readerTypes = {
    DEFAULT: "",
    CONCURRENT: "concurrent"
};

var barcodeTypes = formats.ALL;

function checkBarcodeReader() {
    if (barcodeReader == null) {
        barcodeReader = new dbr.BarcodeReader(readerTypes.DEFAULT);
    }
}
module.exports = {
    decodeFileAsync: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeFileAsync(arguments[0], arguments[1], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeFile: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }
        checkBarcodeReader();
        let result;
        let error;
        barcodeReader.decodeFile(arguments[0], arguments[1], function (err, msg) {
            result = msg;
            error = err;
        }, template);

        if (callback && typeof callback === 'function') {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        } else {
            return result;
        }
    },
    decodeFileStreamAsync: function () {
        var callback = arguments[3];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[4];
        }
        else {
            template = arguments[3];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeFileStreamAsync(arguments[0], arguments[1], arguments[2], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);

            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeFileStream: function () {
        var callback = arguments[3];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[4];
        }
        else {
            template = arguments[3];
        }

        checkBarcodeReader();
        let result;
        let error;
        barcodeReader.decodeFileStream(arguments[0], arguments[1], arguments[2], function (err, msg) {
            result = msg;
            error = err;
        }, template);

        if (callback && typeof callback === 'function') {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        }
        else {
            return result;
        }
    },
    decodeBase64Async: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeBase64Async(arguments[0], arguments[1], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeBase64: function () {
        var callback = arguments[2];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[3];
        }
        else {
            template = arguments[2];
        }

        checkBarcodeReader();
        let result;
        let error;
        barcodeReader.decodeBase64(arguments[0], arguments[1], function (err, msg) {
            result = msg;
            error = err;
        }, template);

        if (callback && typeof callback === 'function') {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        }
        else {
            return result;
        }
    },
    decodeYUYVAsync: function () {
        var callback = arguments[4];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[5];
        }
        else {
            template = arguments[4];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeYUYVAsync(arguments[0], arguments[1], arguments[2], arguments[3], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeYUYV: function () {
        var callback = arguments[4];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[5];
        }
        else {
            template = arguments[4];
        }

        checkBarcodeReader();
        let result;
        let error;
        barcodeReader.decodeYUYV(arguments[0], arguments[1], arguments[2], arguments[3], function (err, msg) {
            result = msg;
            error = err;
        }, template);

        if (callback && typeof callback === 'function') {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        }
        else {
            return result;
        }
    },
    decodeBufferAsync: function () {
        var callback = arguments[5];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[6];
        }
        else {
            template = arguments[5];
        }
        const promise = new Promise((resolve, reject) => {
            checkBarcodeReader();
            barcodeReader.decodeBufferAsync(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], function (err, msg) {
                setTimeout(() => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(msg);
                    }
                }, 0);
            }, template);
        });

        if (callback && typeof callback === 'function') {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
        } else {
            return promise;
        }
    },
    decodeBuffer: function () {
        var callback = arguments[5];
        var template = "";
        if (callback && typeof callback === 'function') {
            template = arguments[6];
        }
        else {
            template = arguments[5];
        }

        checkBarcodeReader();
        let result;
        let error;
        barcodeReader.decodeBuffer(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], function (err, msg) {
            result = msg;
            error = err;
        }, template);

        if (callback && typeof callback === 'function') {
            if (error) {
                callback(error);
            } else {
                callback(null, result);
            }
        }
        else {
            return result;
        }
    },
    setInstanceType: function (type) {
        instanceType = type;
    },
    formats: formats,
    readerTypes: readerTypes,
    barcodeTypes: barcodeTypes,
    BarcodeReader: dbr.BarcodeReader,
    getVersion: dbr.getVersionNumber,
    initLicense: dbr.initLicense,
    setLicenseCachePath: dbr.setLicenseCachePath,
    destroyInstance: function () {
        barcodeReader.destroyInstance();
        barcodeReader = null;
    }
};