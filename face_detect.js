/**
 * Created by rongrong.w on 4/28/15.
 */
/*
 * Reference: http://html5doctor.com/video-canvas-magic/
 */

//constants
var API_URL = 'http://apius.faceplusplus.com/';
var API_KEY = '287838aaa0574583076a49a94d640d55';
var API_SECRET = 'NJoUqMEYT5aXRHDU1t5Pu6rdLzzy25W6';

var currentImg = new Image();

// =========== utility functions ===========

/**
 * Reference: http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 */
function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
}

/**
 * options:
 *     {
     *         img:     <string>   URL or Data-URI,
     *         type:    <string>   'url' or 'dataURI',
     *         success: <function> success callback,
     *         error:   <function> error callback
     *     }
 */
function faceppDetect(options) {
    if ($.support.cors) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 10 * 1000;
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    options.success(JSON.parse(xhr.responseText));
                } else {
                    options.error();
                }
            }
        };

        if (options.type === 'url') {
            xhr.open('GET', API_URL + 'detection/detect?api_key=' + API_KEY + '&api_secret=' + API_SECRET + '&url=' + encodeURIComponent(options.img), true);
            xhr.send();
        } else if (options.type === 'dataURI') {
            xhr.open('POST', API_URL + 'detection/detect?api_key=' + API_KEY + '&api_secret=' + API_SECRET, true);
            var fd = new FormData();
            fd.append('img', dataURItoBlob(options.img));
            xhr.send(fd);
        } else {
            options.error();
        }
    } else { // fallback to jsonp
        if (options.type === 'url') {
            $.ajax({
                url: API_URL + 'detection/detect',
                data: {
                    api_key: API_KEY,
                    api_secret: API_SECRET,
                    url: options.img
                },
                dataType: 'jsonp',
                success: options.success,
                error: options.error,
                timeout: 10 * 1000
            });
        } else {
            options.error();
        }
    }
}

/**
 * Draw face boxes
 *
 * imageInfo:
 * {
         *     width: <image width>
         *     height: <image height>
         *     offsetX: <image offset from canvas>
         *     offsetY: <image offset from canvas>
         *  }
 */
function drawFaces(imageInfo, faces) {
    //startLoading();
    console.log("imageInfo", imageInfo);
    if (faces.length === 0) {
        console.log(message.NO_FACE);
    } else {
        for (var i = faces.length - 1; i >= 0; i--) {
            var face = faces[i];

            // change box color based on gender
            var rgbColor,
                rgbaColor;

            if (face.attribute.gender.value === 'Male') {
                rgbColor = "yellow"//'#12BDDC';
                rgbaColor = 'rgba(18,189,220,0.8)';
            } else {
                rgbColor = '#C537D8';
                rgbaColor = 'rgba(197,55,216,0.8)';
            }

            var pointType = ['eye_left', 'eye_right', 'mouth_left', 'mouth_right'];

            //var scale = Math.min(canvas.width / imageInfo.width, canvas.clientHeight / video.videoHeight, 1);

            // draw facial pointType
            ctx.fillStyle = rgbColor;
            for (var j = pointType.length - 1; j >= 0; j--) {
                ctx.beginPath();
                //console.log("x:", imageInfo.offsetX + face.position[pointType[j]].x * imageInfo.width * 0.01);
                //console.log("y:",  imageInfo.offsetY + face.position[pointType[j]].y * imageInfo.height * 0.01);
                //console.log("r:", face.position.width * 0.01 * 6);
                ctx.arc(imageInfo.offsetX + face.position[pointType[j]].x * imageInfo.width * 0.01,
                    imageInfo.offsetY + face.position[pointType[j]].y * imageInfo.height * 0.01,
                    face.position.width * 0.01 * 10, 0, Math.PI * 2);
                ctx.fill();

            }

            //var faceInferredInfo = "race:\t"+ + face.attribute.race.value + ' (' + face.attribute.race.confidence.toFixed(2)+
            //        ")\nage:\t" + face.attribute.age.value + ' (&#177;' + face.attribute.age.range+
            //        ")\ngender:\t" + face.attribute.gender.value + ' (' + face.attribute.gender.confidence.toFixed(2)
            //        ")";


            //ctx.fillText(faceInferredInfo,
            //    imageInfo.offsetY + (face.position.center.y - face.position.height / 2) * 0.01 * imageInfo.height - 5,
            //    imageInfo.offsetX + (face.position.center.x - face.position.width / 2) * 0.01 * imageInfo.width - 5);

            // create box for highlighting face region
            $('<div/>').css({
                position: 'absolute',
                top: imageInfo.offsetY + (face.position.center.y - face.position.height / 2) * 0.01 * imageInfo.height - 5,
                left: imageInfo.offsetX + (face.position.center.x - face.position.width / 2) * 0.01 * imageInfo.width - 5,
                width: face.position.width * imageInfo.width * 0.01,
                height: face.position.height * imageInfo.height * 0.01,
                border: '5px solid ' + rgbColor,
                borderColor: rgbaColor,
                borderRadius: '10px'
            }).
                //qtip({
                //    content: '<table>' +
                //    //'<tr><td>width</td><td>'        + (face.position.width * 0.01).toFixed(2) + '</td></tr>' +
                //    //'<tr><td>height</td><td>'       + (face.position.height * 0.01).toFixed(2) + '</td></tr>' +
                //    '<tr><td>center</td><td>('      + (face.position.center.x      * 0.01).toFixed(2) + ', ' + (face.position.center.y      * 0.01).toFixed(2) + ')</td></tr>' +
                //    //'<tr><td>eye_left</td><td>('    + (face.position.eye_left.x    * 0.01).toFixed(2) + ', ' + (face.position.eye_left.y    * 0.01).toFixed(2) + ')</td></tr>' +
                //    //'<tr><td>eye_right</td><td>('   + (face.position.eye_right.x   * 0.01).toFixed(2) + ', ' + (face.position.eye_right.y   * 0.01).toFixed(2) + ')</td></tr>' +
                //    //'<tr><td>mouth_left</td><td>('  + (face.position.mouth_left.x  * 0.01).toFixed(2) + ', ' + (face.position.mouth_left.y  * 0.01).toFixed(2) + ')</td></tr>' +
                //    //'<tr><td>mouth_right</td><td>(' + (face.position.mouth_right.x * 0.01).toFixed(2) + ', ' + (face.position.mouth_right.y * 0.01).toFixed(2) + ')</td></tr>' +
                //    '<tr><td>race</td><td>'         + face.attribute.race.value + ' (' + face.attribute.race.confidence.toFixed(2) + '%)</td></tr>' +
                //    '<tr><td>age</td><td>'          + face.attribute.age.value + ' (&#177;' + face.attribute.age.range + ')</td></tr>' +
                //    '<tr><td>gender</td><td>'       + face.attribute.gender.value + ' (' + face.attribute.gender.confidence.toFixed(2) + '%)</td></tr>' +
                //    '</table>',
                //    style: {
                //        //classes: 'detector-tooltip ui-tooltip-light ui-tooltip-typify'
                //        classes:'ui-tooltip-typify'
                //    },
                //    position: {
                //        my: 'bottom left',
                //        at: 'top right'
                //    },
                //    show:{ready:true}
                //}).
                appendTo(faceBox);

            console.log("race:\t"+ face.attribute.race.value + ' (' + face.attribute.race.confidence.toFixed(2)+')');
            console.log("age:\t"+ face.attribute.age.value + ' (&#177;' + face.attribute.age.range+')');
            console.log("gender:\t"+ face.attribute.gender.value + ' (' + face.attribute.gender.confidence.toFixed(2)+')');

            if(face.attribute.race.value !== NaN && face.attribute.gender.value !== NaN && face.attribute.age.value !== NaN)
            {
                    var top = imageInfo.offsetY + (face.position.center.y - face.position.height / 2) * 0.01 * imageInfo.height - 5;
                    var left = imageInfo.offsetX + (face.position.center.x - face.position.width / 2) * 0.01 * imageInfo.width - 5;

                    ctx.font = "25px Arial";

                    ctx.beginPath();

                    ctx.fillText("race:\t" + face.attribute.race.value + ' (' + face.attribute.race.confidence.toFixed(2) + ')',
                        left,
                        top - 60);

                    ctx.fillText("age:\t" + face.attribute.age.value + ' (' + face.attribute.age.range + ')',
                        left,
                        top - 30);

                    ctx.fillText("gender:\t" + face.attribute.gender.value + ' (' + face.attribute.gender.confidence.toFixed(2) + ')',
                        left,
                        top);

            }

        }
    }
    //stopLoading();
}

/**
 * Start face detection.
 *
 * src <string>: image url or dataURI
 * dataURI <boolean>: whether src is a dataURI
 */
function detect(src, dataURI) {

    clearCanvas();
    clearFaceBox();
    currentImg.src = src;
    faceppDetect({
        img:src,
        type:(dataURI?'dataURI':'url'),
        success:function(faces){
            console.log(faces);

            //console.log("video.offsetWidth", video.clientWidth);
            //console.log("video.offsetHeight", video.clientHeight);
            var scale = Math.min(canvas.width/currentImg.width, canvas.height/currentImg.height);

            var imageInfo = {
                width: currentImg.width*scale,
                height: currentImg.height*scale,
                offsetX: (canvas.width-currentImg.width*scale)/2,
                offsetY: (canvas.height-currentImg.height*scale)/2
            };

            drawFaces(imageInfo, faces.face);
        },
        error:function(){
            console.log(message.LOAD_ERROR);
        }

    });

}
