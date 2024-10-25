const loadDbr = require('./nativeLoader');
const dbr = loadDbr();

var barcodeReader = null;
var formats = {
    ALL: 0xFFFFFFFEFFFFFFFF,
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
    CODE_32: 0x1000000,
    PDF417: 0x02000000,
    QR_CODE: 0x04000000,
    DATAMATRIX: 0x08000000,
    AZTEC: 0x10000000,
    MAXICODE: 0x20000000,
    MICRO_QR: 0x40000000,
    MICRO_PDF417: 0x00080000,
    GS1_COMPOSITE: 0x80000000,
    MSI_CODE: 0x100000,
    CODE_11: 0x200000,
    TWO_DIGIT_ADD_ON: 0x400000,
    TWO_FIVE_DIGIT_ADD_ON: 0x800000,
    MATRIX_25: 0x1000000000,
    POSTALCODE: 0x3F0000000000000,
    NONSTANDARD_BARCODE: 0x100000000,
    USPSINTELLIGENTMAIL: 0x10000000000000,
    POSTNET: 0x20000000000000,
    PLANET: 0x40000000000000,
    AUSTRALIANPOST: 0x80000000000000,
    RM4SCC: 0x100000000000000,
    KIX: 0x200000000000000,
    DOTCODE: 0x200000000,
    PHARMACODE_ONE_TRACK: 0x400000000,
    PHARMACODE_TWO_TRACK: 0x800000000,
    PHARMACODE: 0xC00000000
};

var barcodeTypes = formats.ALL;

function checkBarcodeReader() {
    if (barcodeReader == null) {
        barcodeReader = new dbr.BarcodeReader();
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
            const byteArray = Buffer.from(arguments[0], 'base64')
            barcodeReader.decodeFileStreamAsync(byteArray, byteArray.length, arguments[1], function (err, msg) {
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
    formats: formats,
    barcodeTypes: barcodeTypes,
    getVersion: dbr.getVersionNumber,
    initLicense: dbr.initLicense,
    setLicenseCachePath: dbr.setLicenseCachePath,
    destroyInstance: function () {
        barcodeReader.destroyInstance();
        barcodeReader = null;
    },
    createInstance: function () {
        return new dbr.BarcodeReader();
    }
};