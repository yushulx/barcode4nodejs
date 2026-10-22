'use strict';

/**
 * barcode4nodejs
 *
 * Drop-in Dynamsoft Barcode Reader API for Node.js.
 *
 * The public API of this module is unchanged since the native C++ addon era, but
 * the decoding engine is now the pure JavaScript `dynamsoft-capture-vision-for-node`
 * SDK: no node-gyp build step, no prebuilt shared libraries, and always the latest
 * Dynamsoft Barcode Reader engine.
 */

const fs = require('node:fs');

const {
    CaptureVisionRouter,
    LicenseManager,
    EnumImagePixelFormat
} = require('dynamsoft-capture-vision-for-node');

/** Preset template used by default, equivalent to the old `StartCapturing("")`. */
const DEFAULT_TEMPLATE_NAME = 'ReadBarcodes_Default';

/** How long the worker pool stays warm after the last decode (ms). */
const IDLE_TERMINATE_DELAY = 100;

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

/**
 * Single barcode format bits, mapped to the Dynamsoft Capture Vision template
 * keywords. Composite masks (ONED, GS1_DATABAR, POSTALCODE, ...) are simply the
 * union of these bits, so expanding them is always safe.
 */
var FORMAT_BITS = [
    ['BF_CODE_39', 0x1n],
    ['BF_CODE_128', 0x2n],
    ['BF_CODE_93', 0x4n],
    ['BF_CODABAR', 0x8n],
    ['BF_ITF', 0x10n],
    ['BF_EAN_13', 0x20n],
    ['BF_EAN_8', 0x40n],
    ['BF_UPC_A', 0x80n],
    ['BF_UPC_E', 0x100n],
    ['BF_INDUSTRIAL_25', 0x200n],
    ['BF_CODE_39_EXTENDED', 0x400n],
    ['BF_GS1_DATABAR_OMNIDIRECTIONAL', 0x800n],
    ['BF_GS1_DATABAR_TRUNCATED', 0x1000n],
    ['BF_GS1_DATABAR_STACKED', 0x2000n],
    ['BF_GS1_DATABAR_STACKED_OMNIDIRECTIONAL', 0x4000n],
    ['BF_GS1_DATABAR_EXPANDED', 0x8000n],
    ['BF_GS1_DATABAR_EXPANDED_STACKED', 0x10000n],
    ['BF_GS1_DATABAR_LIMITED', 0x20000n],
    ['BF_PATCHCODE', 0x40000n],
    ['BF_MICRO_PDF417', 0x80000n],
    ['BF_MSI_CODE', 0x100000n],
    ['BF_CODE_11', 0x200000n],
    ['BF_TWO_DIGIT_ADD_ON', 0x400000n],
    ['BF_FIVE_DIGIT_ADD_ON', 0x800000n],
    ['BF_CODE_32', 0x1000000n],
    ['BF_PDF417', 0x2000000n],
    ['BF_QR_CODE', 0x4000000n],
    ['BF_DATAMATRIX', 0x8000000n],
    ['BF_AZTEC', 0x10000000n],
    ['BF_MAXICODE', 0x20000000n],
    ['BF_MICRO_QR', 0x40000000n],
    ['BF_GS1_COMPOSITE', 0x80000000n],
    ['BF_NONSTANDARD_BARCODE', 0x100000000n],
    ['BF_DOTCODE', 0x200000000n],
    ['BF_PHARMACODE_ONE_TRACK', 0x400000000n],
    ['BF_PHARMACODE_TWO_TRACK', 0x800000000n],
    ['BF_MATRIX_25', 0x1000000000n],
    ['BF_USPSINTELLIGENTMAIL', 0x10000000000000n],
    ['BF_POSTNET', 0x20000000000000n],
    ['BF_PLANET', 0x40000000000000n],
    ['BF_AUSTRALIANPOST', 0x80000000000000n],
    ['BF_RM4SCC', 0x100000000000000n],
    ['BF_KIX', 0x200000000000000n]
];

/**
 * Baseline settings, captured before this module ever touches the global
 * template. Every format driven configuration is derived from this snapshot.
 */
var baseSettings = null;
try {
    baseSettings = CaptureVisionRouter.outputSettings();
} catch (err) {
    baseSettings = null;
}

var settingsCache = new Map();
var activeSettingsKey = null;
var inflight = 0;
var idleTimer = null;

/* ------------------------------------------------------------------ */
/* Small async gate: lets any number of decodes run in parallel while  */
/* they share the same template settings, and serializes the (rare)    */
/* settings switch against in-flight decodes.                          */
/* ------------------------------------------------------------------ */

function SettingsGate() {
    this.readers = 0;
    this.writing = false;
    this.queue = [];
}

SettingsGate.prototype.acquire = function (exclusive) {
    var self = this;
    return new Promise(function (resolve) {
        self.queue.push({ exclusive: exclusive, resolve: resolve });
        self._pump();
    });
};

SettingsGate.prototype.release = function (exclusive) {
    if (exclusive) {
        this.writing = false;
    } else {
        this.readers--;
    }
    this._pump();
};

SettingsGate.prototype._pump = function () {
    if (this.writing) {
        return;
    }
    if (this.queue.length && this.queue[0].exclusive) {
        if (this.readers === 0) {
            this.writing = true;
            this.queue.shift().resolve();
        }
        return;
    }
    while (this.queue.length && !this.queue[0].exclusive) {
        this.readers++;
        this.queue.shift().resolve();
    }
};

var gate = new SettingsGate();

/* ------------------------------------------------------------------ */
/* Format mask -> template keywords                                    */
/* ------------------------------------------------------------------ */

function formatToNames(format) {
    if (format === undefined || format === null) {
        return ['BF_ALL'];
    }

    var mask;
    if (typeof format === 'bigint') {
        mask = format;
    } else {
        var value = Number(format);
        if (!Number.isFinite(value)) {
            return ['BF_ALL'];
        }
        // `formats.ALL` (0xFFFFFFFEFFFFFFFF) exceeds Number.MAX_SAFE_INTEGER, the
        // literal is rounded and can no longer be decomposed reliably.
        if (format === formats.ALL) {
            return ['BF_ALL'];
        }
        if (Math.abs(value) === 0 || value < 0) {
            // Matches the historical behaviour: an empty or negative mask means ALL.
            return ['BF_ALL'];
        }
        mask = BigInt(Math.trunc(value));
    }

    if (mask <= 0n) {
        return ['BF_ALL'];
    }

    var names = [];
    for (var i = 0; i < FORMAT_BITS.length; i++) {
        var name = FORMAT_BITS[i][0];
        var bit = FORMAT_BITS[i][1];
        if ((mask & bit) === bit) {
            names.push(name);
        }
    }

    return names.length ? names : ['BF_ALL'];
}

/* ------------------------------------------------------------------ */
/* Template settings                                                   */
/* ------------------------------------------------------------------ */

function cloneSettings() {
    if (!baseSettings) {
        throw new Error(
            'barcode4nodejs: failed to read the default Dynamsoft Capture Vision settings. ' +
            'Make sure dynamsoft-capture-vision-for-node is installed correctly.'
        );
    }
    return JSON.parse(JSON.stringify(baseSettings));
}

/**
 * Builds a template document identical to the SDK default, except that the
 * barcode formats of the task(s) used by `ReadBarcodes_Default` are replaced.
 */
function buildFormatSettings(names) {
    var doc = cloneSettings();
    var templates = doc.CaptureVisionTemplates || [];
    var template = null;

    for (var i = 0; i < templates.length; i++) {
        if (templates[i].Name === DEFAULT_TEMPLATE_NAME) {
            template = templates[i];
            break;
        }
    }
    if (!template && templates.length) {
        template = templates[0];
    }
    if (!template) {
        throw new Error('barcode4nodejs: no capture vision template available in the default settings.');
    }

    var roiNames = template.ImageROIProcessingNameArray || [];
    var taskNames = new Set();
    var roiDefs = doc.TargetROIDefOptions || [];
    for (var r = 0; r < roiDefs.length; r++) {
        if (roiNames.indexOf(roiDefs[r].Name) === -1) {
            continue;
        }
        var names2 = roiDefs[r].TaskSettingNameArray || [];
        for (var n = 0; n < names2.length; n++) {
            taskNames.add(names2[n]);
        }
    }

    var tasks = doc.BarcodeReaderTaskSettingOptions || [];
    var applied = 0;
    for (var t = 0; t < tasks.length; t++) {
        if (taskNames.has(tasks[t].Name)) {
            tasks[t].BarcodeFormatIds = names.slice();
            applied++;
        }
    }

    if (!applied) {
        // Fallback: at least honour the requested formats for every barcode task.
        for (var k = 0; k < tasks.length; k++) {
            tasks[k].BarcodeFormatIds = names.slice();
        }
    }

    return JSON.stringify(doc);
}

function settingsForNames(names) {
    var key = 'fmt:' + names.join(',');
    if (!settingsCache.has(key)) {
        settingsCache.set(key, buildFormatSettings(names));
    }
    return settingsCache.get(key);
}

function readTemplateDocument(template) {
    if (template === undefined || template === null) {
        return null;
    }
    if (Buffer.isBuffer(template) || template instanceof Uint8Array) {
        // `fs.readFileSync(path)` used to be a common way to load a template.
        return JSON.parse(Buffer.from(template).toString('utf-8'));
    }
    if (typeof template === 'object') {
        return template;
    }
    if (typeof template !== 'string') {
        return null;
    }

    var text = template.trim();
    if (!text || text === 'undefined' || text === 'null') {
        return null;
    }
    if (text.charAt(0) !== '{') {
        // The old native SDK also accepted a path to a JSON template file.
        if (!fs.existsSync(text)) {
            throw new Error('barcode4nodejs: template file not found: ' + text);
        }
        text = fs.readFileSync(text, 'utf-8');
    }
    return JSON.parse(text);
}

var warnedLegacyTemplate = false;

/**
 * Resolves the `template` argument into a capture plan:
 * { key, settings(), templateName }.
 */
function resolvePlan(template, format) {
    var doc = readTemplateDocument(template);

    if (doc && Array.isArray(doc.CaptureVisionTemplates) && doc.CaptureVisionTemplates.length) {
        var json = JSON.stringify(doc);
        return {
            key: 'tpl:' + json,
            settings: function () { return json; },
            templateName: doc.CaptureVisionTemplates[0].Name
        };
    }

    if (doc && doc.ImageParameter) {
        // Legacy Dynamsoft Barcode Reader 9.x/10.x template. The JSON schema is not
        // understood by the Capture Vision engine anymore, so only the requested
        // barcode formats can be carried over.
        if (!warnedLegacyTemplate) {
            warnedLegacyTemplate = true;
            console.warn(
                '[barcode4nodejs] Legacy Barcode Reader template detected. Only ' +
                '"ImageParameter.BarcodeFormatIds" is mapped to the Capture Vision template ' +
                'format; other legacy options are ignored.'
            );
        }
        var legacyIds = doc.ImageParameter.BarcodeFormatIds;
        var legacyNames = Array.isArray(legacyIds) && legacyIds.length &&
            legacyIds.every(function (id) { return typeof id === 'string'; })
            ? legacyIds.slice()
            : formatToNames(format);

        return {
            key: 'fmt:' + legacyNames.join(','),
            settings: function () { return settingsForNames(legacyNames); },
            templateName: DEFAULT_TEMPLATE_NAME
        };
    }

    if (doc) {
        var raw = JSON.stringify(doc);
        var templates = doc.CaptureVisionTemplates;
        return {
            key: 'tpl:' + raw,
            settings: function () { return raw; },
            templateName: Array.isArray(templates) && templates.length
                ? templates[0].Name
                : DEFAULT_TEMPLATE_NAME
        };
    }

    var names = formatToNames(format);
    return {
        key: 'fmt:' + names.join(','),
        settings: function () { return settingsForNames(names); },
        templateName: DEFAULT_TEMPLATE_NAME
    };
}

/* ------------------------------------------------------------------ */
/* Worker pool housekeeping                                            */
/* ------------------------------------------------------------------ */

function scheduleIdleTermination() {
    if (idleTimer) {
        clearTimeout(idleTimer);
    }
    idleTimer = setTimeout(function () {
        idleTimer = null;
        if (inflight === 0 && gate.writing === false && gate.readers === 0) {
            // Releases the worker threads so short-lived processes can exit.
            CaptureVisionRouter.terminateIdleWorkers().catch(function () { });
        }
    }, IDLE_TERMINATE_DELAY);
    if (typeof idleTimer.unref === 'function') {
        idleTimer.unref();
    }
}

function beginJob() {
    inflight++;
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
}

function endJob() {
    inflight--;
    if (inflight === 0) {
        scheduleIdleTermination();
    }
}

/* ------------------------------------------------------------------ */
/* Result mapping                                                      */
/* ------------------------------------------------------------------ */

function toBarcodeResults(capturedResults, elapsedTime) {
    var results = [];
    for (var i = 0; i < capturedResults.length; i++) {
        var captured = capturedResults[i];
        if (!captured) {
            continue;
        }
        var page = 0;
        var tag = captured.originalImageTag;
        if (tag && typeof tag.pageNumber === 'number') {
            page = tag.pageNumber;
        }
        var items = captured.barcodeResultItems || [];
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            var points = (item.location && item.location.points) || [];
            var p0 = points[0] || { x: 0, y: 0 };
            var p1 = points[1] || { x: 0, y: 0 };
            var p2 = points[2] || { x: 0, y: 0 };
            var p3 = points[3] || { x: 0, y: 0 };
            results.push({
                format: item.formatString,
                value: item.text,
                x1: p0.x,
                y1: p0.y,
                x2: p1.x,
                y2: p1.y,
                x3: p2.x,
                y3: p2.y,
                x4: p3.x,
                y4: p3.y,
                page: page,
                time: elapsedTime,
                angle: item.angle || 0,
                isMirrored: item.isMirrored ? 1 : 0
            });
        }
    }
    return results;
}

/* ------------------------------------------------------------------ */
/* Capture                                                             */
/* ------------------------------------------------------------------ */

async function captureWithPlan(source, plan, multiPage) {
    var exclusive = activeSettingsKey !== plan.key;
    await gate.acquire(exclusive);

    try {
        if (activeSettingsKey !== plan.key) {
            try {
                CaptureVisionRouter.initSettings(plan.settings());
                activeSettingsKey = plan.key;
            } catch (err) {
                // Unknown engine state, force a re-apply on the next call.
                activeSettingsKey = null;
                throw err;
            }
        }

        var started = Date.now();
        var captured;

        if (multiPage) {
            try {
                captured = await CaptureVisionRouter.captureMultiPagesAsync(source, {
                    templateName: plan.templateName,
                    dataTransferType: 'copy'
                });
            } catch (err) {
                if (err && err.dcvErrorCode === -10066) {
                    // EC_MULTI_PAGES_NOT_SUPPORTED - single page input.
                    captured = [await CaptureVisionRouter.captureAsync(source, {
                        templateName: plan.templateName,
                        dataTransferType: 'copy'
                    })];
                } else {
                    throw err;
                }
            }
        } else {
            captured = [await CaptureVisionRouter.captureAsync(source, {
                templateName: plan.templateName,
                dataTransferType: 'copy'
            })];
        }

        return toBarcodeResults(Array.isArray(captured) ? captured : [captured], Date.now() - started);
    } finally {
        gate.release(exclusive);
    }
}

async function decode(source, format, template, options) {
    beginJob();
    try {
        var plan = resolvePlan(template, format);
        return await captureWithPlan(source, plan, Boolean(options && options.multiPage));
    } finally {
        endJob();
    }
}

/* ------------------------------------------------------------------ */
/* Input helpers                                                       */
/* ------------------------------------------------------------------ */

function toBytes(data, length) {
    var view;
    if (data instanceof ArrayBuffer) {
        view = new Uint8Array(data);
    } else if (ArrayBuffer.isView(data)) {
        view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } else if (Array.isArray(data)) {
        view = Uint8Array.from(data);
    } else {
        throw new TypeError('barcode4nodejs: a Buffer, Uint8Array or ArrayBuffer is expected.');
    }

    if (typeof length === 'number' && isFinite(length) && length > 0 && length < view.byteLength) {
        return view.subarray(0, length | 0);
    }
    return view;
}

function isMultiPagePath(filePath) {
    var ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
    return ext === '.pdf' || ext === '.tif' || ext === '.tiff';
}

function isMultiPageBytes(bytes) {
    if (bytes.length >= 5 &&
        bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
        return true; // %PDF
    }
    if (bytes.length >= 4) {
        var tiffLE = bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00;
        var tiffBE = bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a;
        if (tiffLE || tiffBE) {
            return true;
        }
    }
    return false;
}

function dispatch(promise, callback) {
    if (typeof callback === 'function') {
        promise.then(
            function (result) {
                setTimeout(function () { callback(null, result); }, 0);
            },
            function (err) {
                setTimeout(function () { callback(err); }, 0);
            }
        );
        return undefined;
    }
    return promise;
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

function decodeFileAsync() {
    var callback = arguments[2];
    var template = typeof callback === 'function' ? arguments[3] : arguments[2];
    var filePath = String(arguments[0]);

    return dispatch(decode(filePath, arguments[1], template, { multiPage: isMultiPagePath(filePath) }), callback);
}

function decodeFileStreamAsync() {
    var callback = arguments[3];
    var template = typeof callback === 'function' ? arguments[4] : arguments[3];
    var bytes = toBytes(arguments[0], arguments[1]);

    return dispatch(decode(bytes, arguments[2], template, { multiPage: isMultiPageBytes(bytes) }), callback);
}

function decodeBase64Async() {
    var callback = arguments[2];
    var template = typeof callback === 'function' ? arguments[3] : arguments[2];
    var bytes = new Uint8Array(Buffer.from(String(arguments[0]), 'base64'));

    return dispatch(decode(bytes, arguments[1], template, { multiPage: isMultiPageBytes(bytes) }), callback);
}

function decodeYUYVAsync() {
    var callback = arguments[4];
    var template = typeof callback === 'function' ? arguments[5] : arguments[4];

    var src = toBytes(arguments[0]);
    var width = Math.max(0, arguments[1] | 0);
    var height = Math.max(0, arguments[2] | 0);
    var size = width * height;
    var gray = new Uint8Array(size);
    for (var i = 0, j = 0; i < size; i++, j += 2) {
        gray[i] = src[j] | 0;
    }

    var imageData = {
        bytes: gray,
        width: width,
        height: height,
        stride: width,
        format: EnumImagePixelFormat.IPF_GRAYSCALED
    };

    return dispatch(decode(imageData, arguments[3], template, { multiPage: false }), callback);
}

function decodeBufferAsync() {
    var callback = arguments[5];
    var template = typeof callback === 'function' ? arguments[6] : arguments[5];

    var bytes = toBytes(arguments[0]);
    var width = Math.max(0, arguments[1] | 0);
    var height = Math.max(0, arguments[2] | 0);
    var stride = Math.max(0, arguments[3] | 0);

    var pixelFormat = EnumImagePixelFormat.IPF_RGB_888;
    if (width === stride) {
        pixelFormat = EnumImagePixelFormat.IPF_GRAYSCALED;
    } else if (width * 3 === stride) {
        pixelFormat = EnumImagePixelFormat.IPF_RGB_888;
    } else if (width * 4 === stride) {
        pixelFormat = EnumImagePixelFormat.IPF_ARGB_8888;
    }

    var imageData = {
        bytes: bytes,
        width: width,
        height: height,
        stride: stride,
        format: pixelFormat
    };

    return dispatch(decode(imageData, arguments[4], template, { multiPage: false }), callback);
}

function BarcodeReader() {
    this._destroyed = false;
}

BarcodeReader.prototype._ensureAlive = function () {
    if (this._destroyed) {
        throw new Error('barcode4nodejs: this BarcodeReader instance has been destroyed.');
    }
};

BarcodeReader.prototype.decodeFileAsync = function () {
    this._ensureAlive();
    return decodeFileAsync.apply(null, arguments);
};

BarcodeReader.prototype.decodeFileStreamAsync = function () {
    this._ensureAlive();
    return decodeFileStreamAsync.apply(null, arguments);
};

BarcodeReader.prototype.decodeBase64Async = function () {
    this._ensureAlive();
    return decodeBase64Async.apply(null, arguments);
};

BarcodeReader.prototype.decodeYUYVAsync = function () {
    this._ensureAlive();
    return decodeYUYVAsync.apply(null, arguments);
};

BarcodeReader.prototype.decodeBufferAsync = function () {
    this._ensureAlive();
    return decodeBufferAsync.apply(null, arguments);
};

BarcodeReader.prototype.destroyInstance = function () {
    this._destroyed = true;
};

module.exports = {
    decodeFileAsync: decodeFileAsync,
    decodeFileStreamAsync: decodeFileStreamAsync,
    decodeBase64Async: decodeBase64Async,
    decodeYUYVAsync: decodeYUYVAsync,
    decodeBufferAsync: decodeBufferAsync,
    formats: formats,
    barcodeTypes: barcodeTypes,
    getVersion: function () {
        return CaptureVisionRouter.version;
    },
    initLicense: function (license) {
        try {
            LicenseManager.initLicense(String(license));
            return 0;
        } catch (err) {
            console.error('InitLicense: ' + (err && err.message ? err.message : err));
            return err && typeof err.dcvErrorCode === 'number' ? err.dcvErrorCode : -1;
        }
    },
    setLicenseCachePath: function (cachePath) {
        LicenseManager.setLicenseCachePath(String(cachePath));
        return 0;
    },
    destroyInstance: function () {
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        activeSettingsKey = null;
        CaptureVisionRouter.terminateIdleWorkers().catch(function () { });
    },
    createInstance: function () {
        return new BarcodeReader();
    }
};
