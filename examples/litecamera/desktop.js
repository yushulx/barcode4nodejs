var dbr = require('../../index.js');
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");

var litecam = require('litecam');
const nodecamera = new litecam.NodeCam();
console.log(litecam.getDeviceList());

var isWorking = false;
var results = null;

async function decode(buffer, width, height) {
    if (isWorking) {
        return;
    }
    isWorking = true;
    results = await dbr.decodeBufferAsync(buffer, width, height, width * 3, dbr.formats.ALL, "");
    isWorking = false;
}

function show() {
    if (nodecamera.waitKey('q')) {

        let frame = nodecamera.captureFrame();
        if (frame) {
            nodecamera.showFrame(frame['width'], frame['height'], frame['data']);

            decode(frame['data'], frame['width'], frame['height']);

            if (results) {
                for (let i = 0; i < results.length; i++) {
                    result = results[i];

                    let contour_points = [[result['x1'], result['y1']], [result['x2'], result['y2']], [result['x3'], result['y3']], [result['x4'], result['y4']]];
                    nodecamera.drawContour(contour_points)

                    nodecamera.drawText(result['value'], result['x1'], result['y1'], 24, [255, 0, 0])
                }

            }
        }

        setTimeout(show, 30);
    }
    else {
        nodecamera.release();
    }
}

if (nodecamera.open(0)) {
    let mediaTypes = nodecamera.listMediaTypes();
    console.log(mediaTypes);

    nodecamera.createWindow(nodecamera.getWidth(), nodecamera.getHeight(), "Camera Stream");
    show();
}