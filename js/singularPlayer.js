var sequencerObjs = [];
var markers = [];

var SVideo = videojs('SingularVideo').ready(function(){
  console.log('PLAYER READY')
  /**** SINGULAR BUTTON ******/
  var myPlayer = this,
    controlBar,
    newElement = document.createElement('div'),
    newImage = document.createElement('img');
    // Assign id and classes to div for icon
    newElement.id = 'downloadButton';
    newElement.className = 'downloadStyle vjs-control';
    // Assign properties to elements and assign to parents
    newImage.setAttribute('src','https://alpha.singular.live/images/logo.png');
    newImage.setAttribute('style','width: 25px; height: 20px; top: 5px; position: relative; cursor: pointer');
    newImage.setAttribute('onClick','loadPayload()');
    newElement.appendChild(newImage);
    // Get control bar and insert before elements
    // Remember that getElementsByClassName() returns an array
    controlBar = document.getElementsByClassName('vjs-control-bar')[0];
    // Change the class name here to move the icon in the controlBar
    insertBeforeNode = document.getElementsByClassName('vjs-fullscreen-control')[0];
    // Insert the icon div in proper location
    controlBar.insertBefore(newElement,insertBeforeNode);
  /**** EOF S BUTTON ******/
  
  this.on('loadedmetadata', function(){ 
    setSLayerSize(SVideo.width(), SVideo.height())
  })

  
  
});

function setSLayerSize(width, height){
  var SLayer = document.getElementById('singularLayer')
  var SVideo = document.getElementById('SingularVideo')

  SLayer.style.width = width;
  SLayer.style.height = height;
  
}

// Create the Singular Layer Element:
var el = videojs.createEl('iframe', {
  id: 'singularLayer',
  clasName: 'singularLayer',
  src: 'https://alpha.singular.live/singularplayer/client',
  width: SVideo.width_,
  height: SVideo.height_,
});
// Append the Singular Layer Element to the player:
SVideo.el().appendChild(el, 'I am Singular');

// Create the dialog window to accept JSON payloads:
var dia = videojs.createEl('div', {
  id: 'singular-dialog',
  width: SVideo.width_,
  height: SVideo.height_,
  innerHTML: '<textarea id="payload-input"></textarea><button id="btn-loadPayload" onClick="parsePayload()">Load</button><button id="btn-loadPayloadCancel" onClick="cancelParsePayload()">Cancel</button>'
});
// Append the Dialog element to the player:
SVideo.el().appendChild(dia, 'I am Singular');
// Add the markers to the timeline (optional)
SVideo.markers({markers: markers});

// Change the Singular Layer size when fullscreen toggled:
SVideo.on("fullscreenchange",
    function () {
      if(SVideo.isFullscreen()){
        setSLayerSize(screen.width, screen.height);
      } else {
        setSLayerSize(SVideo.width(), SVideo.height());
      }
        
});
// Play the sequencers when the video is played:
SVideo.on("play", function(){
  console.log('VIDEO PLAYED')
  for(var s = 0; s < sequencerObjs.length; s++){
      sequencerObjs[s].start();
  }
})
// Stop the sequencers when the video is paused:
SVideo.on("pause", function(){
  console.log('VIDEO PAUSED')
  for(var s = 0; s < sequencerObjs.length; s++){
      sequencerObjs[s].stop();
  }
})
// Seek the sequencers when the video is seeked:
SVideo.on("seeking", function(){
  var curTime = this.currentTime();
  console.log('VIDEO SEEKING', curTime);
  for(var s = 0; s < sequencerObjs.length; s++){
      sequencerObjs[s].seek(curTime);
  }
})

// Change the Singular Layer size when the video is changed:
SVideo.on("durationchange", function(){
  setSLayerSize(SVideo.videoWidth(), SVideo.videoHeight())
});

var SLayer = SingularPlayer("singularLayer");

function loadPayload(){
  document.getElementById('singular-dialog').style.display = 'block';
}

function cancelParsePayload(){
  document.getElementById('singular-dialog').style.display = 'none';
}

function parsePayload(){
  var hasErros = false;
  var payload = JSON.parse(document.getElementById('payload-input').value);
  console.log('PAYLOAD:', payload );

  if(payload.video){
    SVideo.src({type: 'video/mp4', src: payload.video});
    SVideo.load();
  }

  if(payload.compId){
    SLayer.loadComposition(payload.compId, function () { 
      console.info('COMP ' + payload.compId + ' Loaded successfully');
      var markers = [];

      if(payload.sequencers){

        SVideo.markers.removeAll();
        sequencerObjs = [];

        for (var key in payload.sequencers) {
          sequencerObjs.push(SLayer.getSequencer(key))
          sequencerObjs[sequencerObjs.length -1].setPayload(payload.sequencers[key]);

          for(var s = 0; s < payload.sequencers[key].length; s++){
            console.log('ADDED MARKER AT: ', payload.sequencers[key][s].beginTime)
            SVideo.markers.add([{ time: payload.sequencers[key][s].beginTime, class:'marker-in'}]); 
            SVideo.markers.add([{ time: payload.sequencers[key][s].endTime, class:'marker-out'}]); 
          }
          
          
        }

        document.getElementById('singular-dialog').style.display = 'none';
      } else {
        var hasErros = true;
        alert('No sequencers found in payload');
      }
    });
  } else {
    var hasErros = true;
    alert('No comp id provided');
  }


}