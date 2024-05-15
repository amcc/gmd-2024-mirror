// HOW TO USE
// predictWebcam(video) will start predicting landmarks

// pass a video MediaElement using createCapture
// make sure to call predictWebcam as a callback to createCapture
// this ensures the video is ready

// parts index and documentation:
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker

let capture;
let captureEvent;

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
  },
  Open_Palm: {
    name: "Open Palm",
    description: "Hand is open",
    image: "images/open-palm.jpg",
  },
  Pointing_Up: {
    name: "Pointing Up",
    description: "Index finger is pointing up",
    image: "images/pointing-up.jpg",
  },
  Thumb_Down: {
    name: "Thumb Down",
    description: "Thumb is pointing down",
    image: "images/thumbs-down.jpg",
  },
  Thumb_Up: {
    name: "Thumb Up",
    description: "Thumb is pointing up",
    image: "images/thumbs-up.jpg",
  },
  Victory: {
    name: "Victory",
    description: "Index and middle finger are up",
    image: "images/victory.jpg",
  },
  ILoveYou: {
    name: "I Love You",
    description: "Index, middle and ring fingers are up",
    image: "images/love.jpg",
  },
};

let positionShift = {
  x: 0,
  y: 0,
};

let image;

function setup() {
  let canvasParent = select("#canvas-container");
  let canvas = createCanvas(canvasParent.width, canvasParent.width);
  canvas.parent("#canvas-container");
  captureWebcam();
  handImage = select("#gesture-image");
  console.log(handImage);
}

function draw() {
  // background(255);
  clear();

  if (!mediaPipe.loaded && frameCount > 30) {
    textAlign(CENTER, CENTER);
    textFont("Roboto");
    textSize(width / 12);
    text(
      "loading gestures",
      width / 2,
      height / 2 + (sin(frameCount / 80) * height) / 15
    );
  }
  // flip the webcam image so it looks like a mirror
  push();
  scale(-1, 1); // mirror webcam
  // image(capture, -capture.width, 0); // draw webcam
  scale(-1, 1); // unset mirror
  pop();
  if (mediaPipe.gestures.length > 0) {
    if (gestureDictionary[mediaPipe.gestures[0][0].categoryName]) {
      // text(
      //   gestureDictionary[mediaPipe.gestures[0][0].categoryName].name,
      //   10,
      //   100
      // );
      if (mediaPipe.gestures[0][0].categoryName !== "none") {
        handImage.elt.src =
          gestureDictionary[mediaPipe.gestures[0][0].categoryName].image;
      }
    }
  }
  // landmarks contain an array of hands
  if (mediaPipe.landmarks.length > 0) {
    mediaPipe.landmarks.forEach((hand, index) => {
      // each hand contains an array of finger/knuckle positions

      // handedness stores if the hands are right/left
      let handedness = mediaPipe.handednesses[index][0].displayName;

      // if using a front camera hands are the wrong way round so we flip them
      handedness === "Right" ? (handedness = "Left") : (handedness = "Right");

      // lets colour each hand depeding on whether its the first or second hand
      handedness === "Right" ? fill(255, 0, 0) : fill(0, 255, 0);

      hand.forEach((part, index) => {
        // each part is a knuckle or section of the hand
        // we have x, y and z positions so we could also do this in 3D (WEBGL)
        if (index === 8) {
          textSize(30);
          // text(
          //   handedness,
          //   ...getFlipPos(part, positionShift.x + 20, positionShift.y)
          // );
        }
        // circle(
        //   ...getFlipPos(part, positionShift.x, positionShift.y),
        //   part.z * 100
        // );
      });
    });
  }
}

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
function captureWebcam() {
  capture = createCapture(
    {
      audio: false,
      video: {
        facingMode: "user",
      },
    },
    function (e) {
      captureEvent = e;
      console.log(captureEvent.getTracks()[0].getSettings());
      // do things when video ready
      // until then, the video element will have no dimensions, or default 640x480
      capture.srcObject = e;

      setCameraDimensions();
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
function setCameraDimensions() {
  // resize the capture depending on whether
  // the camera is landscape or portrait

  let ratio = capture.width / capture.height;

  if (capture.width > capture.height) {
    capture.size(height * ratio, height);
    positionShift.x = (width - height * ratio) / 2;
    capture.position(positionShift.x, 0);
  } else {
    capture.size(width, width / ratio);
    positionShift.y = (height - width / ratio) / 2;
    capture.position(0, positionShift.y);
  }
}

// resize the canvas when the window is resized
// also reset the camera dimensions
function windowResized() {
  let canvasParent = select("#canvas-container");
  resizeCanvas(canvasParent.width, canvasParent.width);
  setCameraDimensions();
}
