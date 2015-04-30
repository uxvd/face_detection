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
canvas.width = 640;//hard coded
canvas.height = 480;//hard coded
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

                //var scale = Math.min(width / video.videoWidth, height / video.videoHeight, 1);
                var tmpCanvas = document.createElement('canvas');
                //tmpCanvas.height = video.videoHeight * scale;
                //tmpCanvas.width = video.videoWidth * scale;
                //tmpCanvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth * scale, video.videoHeight * scale);

                tmpCanvas.height = video.videoHeight/2;
                tmpCanvas.width = video.videoWidth/2;
                tmpCanvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth/2, video.videoHeight/2);

                detect(tmpCanvas.toDataURL('image/jpeg'), true);

            }, 500);

        },
        errorCallback);
}
else{
    //video.src = 'somevideo.webm';
    console.log('getUserMedia LOAD_ERROR');
}

function clearCanvas() {
    //ctx.fillStyle = '#EEE';
    //ctx.fillRect(0, 0, width, height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function clearFaceBox(){
    while(faceBox.hasChildNodes()){
        faceBox.removeChild(faceBox.firstChild);
    }

}



