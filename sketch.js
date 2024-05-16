// HOW TO USE
// predictWebcam(video) will start predicting landmarks

// pass a video MediaElement using createCapture
// make sure to call predictWebcam as a callback to createCapture
// this ensures the video is ready

// parts index and documentation:
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker

let capture;
let captureEvent;
let handImage, handVideo;
let gestureState = "none";

// dictionary of possible gestures
let gestureDictionary = {
  none: {
    name: "None",
    description: "No gesture detected",
  },
  Closed_Fist: {
    name: "Closed Fist",
    description: "Fingers are closed",
    image: "images/closed-fist.jpg",
    video: "videos/fist.mp4",
  },
  Open_Palm: {
    name: "Open Palm",
    description: "Hand is open",
    image: "images/open-palm.jpg",
    video: "videos/palm.mp4",
  },
  Pointing_Up: {
    name: "Pointing Up",
    description: "Index finger is pointing up",
    image: "images/pointing-up.jpg",
    video: "videos/point-up.mp4",
  },
  Thumb_Down: {
    name: "Thumb Down",
    description: "Thumb is pointing down",
    image: "images/thumbs-down.jpg",
    video: "videos/thumbs-down.mp4",
  },
  Thumb_Up: {
    name: "Thumb Up",
    description: "Thumb is pointing up",
    image: "images/thumbs-up.jpg",
    video: "videos/thumbs-up.mp4",
  },
  Victory: {
    name: "Victory",
    description: "Index and middle finger are up",
    image: "images/victory.jpg",
    video: "videos/victory.mp4",
  },
  ILoveYou: {
    name: "I Love You",
    description: "Index, middle and ring fingers are up",
    image: "images/love.jpg",
    video: "videos/love.mp4",
  },
};

let positionShift = {
  x: 0,
  y: 0,
};

let image;

const sketch = (p5) => {
  p5.setup = () => {
    let canvasParent = p5.select("#canvas-container");
    let canvas = p5.createCanvas(canvasParent.width, canvasParent.width);
    canvas.parent("#canvas-container");
    captureWebcam(p5);
    // handImage = select("#gesture-image");
    handVideo = p5.select("#gesture-video");
    console.log("handVideo", handVideo);
  };

  p5.draw = () => {
    // background(255);
    p5.clear();

    if (!mediaPipe.loaded && p5.frameCount > 30) {
      p5.textAlign(CENTER, CENTER);
      p5.textFont("Roboto");
      p5.textSize(width / 12);
      p5.text(
        "loading gestures",
        width / 2,
        height / 2 + (sin(frameCount / 80) * height) / 15
      );
    }
    // flip the webcam image so it looks like a mirror
    // p5.push();
    // p5.scale(-1, 1); // mirror webcam
    // // image(capture, -capture.width, 0); // draw webcam
    // p5.scale(-1, 1); // unset mirror
    // p5.pop();
    if (mediaPipe.gestures.length > 0) {
      if (gestureDictionary[mediaPipe.gestures[0][0].categoryName]) {
        if (gestureState !== mediaPipe.gestures[0][0].categoryName) {
          gestureState = mediaPipe.gestures[0][0].categoryName;
          if (mediaPipe.gestures[0][0].categoryName !== "none") {
            let gestureVideo = handVideo.elt;
            gestureVideo.pause();
            gestureVideo.src =
              gestureDictionary[mediaPipe.gestures[0][0].categoryName].video;
            gestureVideo.load();
            gestureVideo.play();
          }
        }
      }
    }
  };

  // resize the canvas when the window is resized
  // also reset the camera dimensions
  p5.windowResized = () => {
    let canvasParent = p5.select("#canvas-container");
    p5.resizeCanvas(canvasParent.width, canvasParent.width);
    setCameraDimensions(p5);
  };
};

// return flipped x and y positions
function getFlipPos(part, xAdd = 0, yAdd = 0) {
  return [
    capture.width - part.x * capture.width + xAdd,
    part.y * capture.height + yAdd,
  ];
}

// this function helps to captuer the webcam in a way that ensure video is loaded
// before we start predicting landmarks. Creatcapture has a callback which is
// only called when the video is correctly loaded. At that point we set the dimensions
// and start predicting landmarks
function captureWebcam(p5) {
  capture = p5.createCapture(
    {
      audio: false,
      video: {
        facingMode: "user",
      },
    },
    function (e) {
      captureEvent = e;
      // console.log(captureEvent.getTracks()[0].getSettings());
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480
      capture.srcObject = e;

      setCameraDimensions(p5);
      mediaPipe.predictWebcam(capture);
    }
  );
  capture.elt.setAttribute("playsinline", "");
  capture.parent("#canvas-container");
  // capture.hide();
}

// this function sets the dimensions of the video element to match the
// dimensions of the camera. This is important because the camera may have
// different dimensions than the default video element
function setCameraDimensions(p5) {
  // resize the capture depending on whether
  // the camera is landscape or portrait

  let ratio = capture.width / capture.height;

  if (capture.width > capture.height) {
    capture.size(p5.height * ratio, p5.height);
    positionShift.x = (p5.width - p5.height * ratio) / 2;
    capture.position(positionShift.x, 0);
  } else {
    capture.size(p5.width, p5.width / ratio);
    positionShift.y = (p5.height - p5.width / ratio) / 2;
    capture.position(0, positionShift.y);
  }
}

let myp5 = new p5(sketch);
