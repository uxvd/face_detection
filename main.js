/**
 * Created by rongrong.w on 4/27/15.
 */



//error message
var message = {
    URL_ERROR:'Invalid URL',
    LOAD_ERROR:'Failed to Load',
    LOADING:'Loading',
    NO_FACE:'No face detected',
    NO_CAMERA:'No camera available'
};

var downsampleScale = 2;

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (hasGetUserMedia()) {
    // Good to go!
} else {
    alert('getUserMedia() is not supported in your browser');
}
var errorCallback = function(e){
    console.log('Rejected', e);
}

navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUsermedia;

var video = document.getElementById('livevideo');
var videoFrameInterval;

//canvas overlayed on top of video
var canvas = document.getElementById('overlaycanvas');
var ctx = canvas.getContext('2d');

var faceBox = document.getElementById('facebox');

//Webcam Input

if(navigator.getUserMedia){
    navigator.getUserMedia(
        {audio:false, video:true},
        function(stream)
        {
            video.src = window.URL.createObjectURL(stream);

            video.onerror = function(){
                stream.stop();
            }

            videoFrameInterval = window.setInterval(function(){

                canvas.width = video.clientWidth;
                canvas.height = video.clientHeight;

                //var scale = Math.min(canvas.width / video.videoWidth, canvas.height / video.videoHeight);

                var tmpCanvas = document.createElement('canvas');

                tmpCanvas.height = video.videoHeight;
                tmpCanvas.width = video.videoWidth;
                tmpCanvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                detect(tmpCanvas.toDataURL('image/jpeg'), true);

            }, 1000);

        },
        errorCallback);
}
else{
    //video.src = 'somevideo.webm';
    console.log('getUserMedia LOAD_ERROR');
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function clearFaceBox(){
    while(faceBox.hasChildNodes()){
        faceBox.removeChild(faceBox.firstChild);
    }

    //clear qtip
    var nodes = document.getElementsByClassName('ui-tooltip-typify');
    if(nodes.length>6)
     $('.ui-tooltip-typify').remove();

}



