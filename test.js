'use strict';

/**
 * Smoke test / sample.
 *
 *   DCV_LICENSE=YOUR-LICENSE-KEY node test.js [image-file]
 *
 * Without a license key only the API surface is verified; the decoding part is
 * skipped.
 */

const path = require('node:path');
const dbr = require('./index.js');

const license = process.env.DCV_LICENSE || '';
const imagePath = path.resolve(process.argv[2] || path.join(__dirname, 'images', 'test.tif'));

function verifyApi() {
    const required = [
        'decodeFileAsync',
        'decodeFileStreamAsync',
        'decodeBase64Async',
        'decodeYUYVAsync',
        'decodeBufferAsync',
        'initLicense',
        'setLicenseCachePath',
        'getVersion',
        'createInstance',
        'destroyInstance'
    ];

    for (const name of required) {
        if (typeof dbr[name] !== 'function') {
            throw new Error('Missing API: ' + name);
        }
    }

    if (dbr.formats.ALL !== 0xFFFFFFFEFFFFFFFF || dbr.formats.QR_CODE !== 0x04000000) {
        throw new Error('Format constants are corrupted.');
    }

    console.log('API surface OK');
    console.log('SDK version: ' + dbr.getVersion());
}

(async function () {
    verifyApi();

    if (!license) {
        console.log('\nDCV_LICENSE is not set - skipping the decoding test.');
        console.log('Get a 30-day trial license: https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform');
        return;
    }

    const ret = dbr.initLicense(license);
    if (ret !== 0) {
        process.exitCode = 1;
        return;
    }

    const start = Date.now();
    const results = await dbr.decodeFileAsync(imagePath, dbr.formats.ALL, '');
    console.log('\nDecoded ' + results.length + ' barcode(s) in ' + (Date.now() - start) + ' ms:');

    for (const result of results) {
        console.log('-'.repeat(48));
        console.log('Format: ' + result.format);
        console.log('Value : ' + result.value);
        console.log('x1: ' + result.x1 + ' y1: ' + result.y1);
        console.log('x2: ' + result.x2 + ' y2: ' + result.y2);
        console.log('x3: ' + result.x3 + ' y3: ' + result.y3);
        console.log('x4: ' + result.x4 + ' y4: ' + result.y4);
        console.log('page: ' + result.page);
        console.log('decoding time: ' + result.time);
    }
    console.log('-'.repeat(48));

    dbr.destroyInstance();
})().catch(function (err) {
    console.error(err);
    process.exitCode = 1;
});
