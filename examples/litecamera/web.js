
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const http = require('http');
var dbr = require('../../index.js');
// Get a license key from https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
dbr.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==");
var litecam = require('litecam');
const nodecamera = new litecam.NodeCam();
console.log(litecam.getDeviceList());

var isWorking = false;
var img = null;
var results = null;
var ctx = null;
var canvas = null;
var width = 0;
var height = 0;

async function decode(buffer, width, height) {
    if (isWorking) {
        return;
    }
    isWorking = true;
    results = await dbr.decodeBufferAsync(buffer, width, height, width * 3, dbr.formats.ALL, "");
    isWorking = false;
}

function capture() {
    let frame = nodecamera.captureFrame();
    if (frame) {
        ctx.clearRect(0, 0, nodecamera.getWidth(), nodecamera.getHeight());
        rgbData = frame['data'];

        const imageData = ctx.createImageData(width, height);

        for (let i = 0; i < width * height; i++) {
            const offset = i * 4;
            imageData.data[offset] = rgbData[i * 3 + 2];
            imageData.data[offset + 1] = rgbData[i * 3 + 1];
            imageData.data[offset + 2] = rgbData[i * 3];
            imageData.data[offset + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        decode(frame['data'], frame['width'], frame['height']);

        if (results) {
            for (let i = 0; i < results.length; i++) {
                result = results[i];

                let contour_points = [[result['x1'], result['y1']], [result['x2'], result['y2']], [result['x3'], result['y3']], [result['x4'], result['y4']]];

                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.moveTo(contour_points[0][0], contour_points[0][1]);
                for (let i = 1; i < contour_points.length; i++) {
                    ctx.lineTo(contour_points[i][0], contour_points[i][1]);
                }
                ctx.closePath();
                ctx.stroke();

                ctx.fillStyle = 'blue';
                ctx.font = '20px Arial';

                ctx.fillText(result['value'], result['x1'], result['y1']);
            }

        }

        const jpegBuffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
        // fs.writeFileSync('output.jpg', jpegBuffer);
        img = jpegBuffer;
    }

    setTimeout(capture, 30);
}

if (nodecamera.open(0)) {
    width = nodecamera.getWidth();
    height = nodecamera.getHeight();
    canvas = createCanvas(width, height);
    ctx = canvas.getContext('2d');
    capture();
}

var html = fs.readFileSync("index.htm", "utf8");

var server = http.createServer(function (req, res) {   //create web server
    if (req.url.startsWith("/image")) {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.write(img);
        res.end();

    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html' });

        // set response content    
        res.write(html);
        res.end();
    }

});

server.listen(2024);

console.log('Node.js web server is running at port 2024...')