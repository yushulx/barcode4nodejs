/**
 *  HTML5 Webcam Barcode Reader with Dynamsoft Barcode Reader SDK.
 *  Support PC & Mobile.
 */
var videoElement = document.querySelector('video');
var canvas = document.getElementById('pcCanvas');
var mobileCanvas = document.getElementById('mobileCanvas');
var ctx = canvas.getContext('2d');
var mobileCtx = mobileCanvas.getContext('2d');
var videoSelect = document.querySelector('select#videoSource');
var videoOption = document.getElementById('videoOption');
var buttonGo = document.getElementById('go');
var barcode_result = document.getElementById('dbr');

var isPaused = false;
var videoWidth = 640,
  videoHeight = 480;
var mobileVideoWidth = 240,
  mobileVideoHeight = 320;
var isPC = true;

// check devices
function browserRedirect() {
  var deviceType;
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
  if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
    deviceType = 'phone';
  } else {
    deviceType = 'pc';
  }
  return deviceType;
}

if (browserRedirect() == 'pc') {
  isPC = true;
} else {
  isPC = false;
}

// initialize camera infos for Chrome
function initCameraSource(sourceInfos) {
  for (var i = 0; i < sourceInfos.length; i++) {
    var sourceInfo = sourceInfos[i];
    var option = document.createElement('option');
    option.value = sourceInfo.id;
    if (sourceInfo.kind === 'video') {
      option.text = sourceInfo.label || "Camera " + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    } else {
      console.log("Source info: " + sourceInfo);
    }
  }
  toggleCamera();
}

// stackoverflow: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata/5100158
function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {
    type: mimeString
  });
}

function successCallback(stream) {
  window.stream = stream;
  videoElement.src = window.URL.createObjectURL(stream);
  videoElement.play();
}

function errorCallback(error) {
  console.log("Error: " + error);
}

function startCamera(constraints) {
  if (navigator.getUserMedia) {
    navigator.getUserMedia(constraints, successCallback, errorCallback);
  } else {
    console.log("getUserMedia not supported");
  }
}

function toggleCamera() {
  var videoSource = videoSelect.value;
  var constraints = {
    video: {
      optional: [{
        sourceId: videoSource
      }]
    }
  };

  startCamera(constraints);
}

// add button event
buttonGo.onclick = function () {
  if (isPC) {
    canvas.style.display = 'none';
  } else {
    mobileCanvas.style.display = 'none';
  }

  isPaused = false;
  scanBarcode();
  buttonGo.disabled = true;
};

// query supported Web browsers
if (navigator.getUserMedia || navigator.mozGetUserMedia) {
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;
  startCamera({
    video: {
      // mandatory: {
      //   maxWidth: 640,
      //   maxHeight: 480
      // }
    }
  });
} else if (navigator.webkitGetUserMedia) {
  videoOption.style.display = 'block';
  navigator.getUserMedia = navigator.webkitGetUserMedia;
  MediaStreamTrack.getSources(initCameraSource);
  videoSelect.onchange = toggleCamera;
}

// scan barcode
function scanBarcode() {
  if (isPaused) {
    return;
  }

  var data = null,
    context = null,
    width = 0,
    height = 0,
    dbrCanvas = null;

  if (isPC) {
    context = ctx;
    width = videoWidth;
    height = videoHeight;
    dbrCanvas = canvas;
  } else {
    context = mobileCtx;
    width = mobileVideoWidth;
    height = mobileVideoHeight;
    dbrCanvas = mobileCanvas;
  }

  context.drawImage(videoElement, 0, 0, width, height);
  // convert canvas to base64
  var base64 = dbrCanvas.toDataURL('image/png', 1.0);
  var imgData = base64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
  // var imgData = JSON.stringify(data);
  $.ajax({
    url: '/dbr',
    dataType: 'json',
    data: imgData,
    type: 'POST',
    success: function (result) {
      console.log(result);
      if (isPaused) {
        return;
      }
      var barcode_result = document.getElementById('dbr');
      barcode_result.textContent = result;

      // display barcode result
      if (result.indexOf("No barcode") == -1) {
        isPaused = true;
        buttonGo.disabled = false;
        if (isPC) {
          canvas.style.display = 'block';
        } else {
          mobileCanvas.style.display = 'block';
        }
      }
      else {
        setTimeout(scanBarcode, 200);
      }
    }
  });
}

