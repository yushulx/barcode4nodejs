import { BarcodeResult } from '../..';
import * as dbr from '../../';

dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");

async function test() {
    try {
    let params = {
        "ImageParameter": {
        "Name": "Custom_143301_827",
        "BarcodeFormatIds": [
            "BF_ALL"
        ],
        "DeblurLevel": 9,
        "ExpectedBarcodesCount": 100,
        "ScaleDownThreshold": 1200000,
        "Timeout": 100000
        },
        "Version": "3.0"
    };
    let template = JSON.stringify(params);

    var result: BarcodeResult[] = await dbr.decodeFileAsync('test.tif', dbr.formats.ALL, template);
    console.log(result);
    } catch (error) {
    console.log(error);
    }
}

test();