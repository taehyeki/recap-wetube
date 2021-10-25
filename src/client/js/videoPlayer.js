const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const mute = document.getElementById("mute");
const muteBtnIcon = mute.querySelector("i");
const time = document.getElementById("time");
const volume = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

let controlsTimeout;
let controlsTimeout2;
let volumValue = 0.5;
video.volume = volumValue;

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = (e) => {
  if (video.muted && volumValue == 0) {
    video.muted = false;
    video.volume = 0.5;
    volumeValue = 0.5;
    muteBtnIcon.classList = "fas fa-volume-mute";
    volume.value = 0.5;
    return;
  }
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volume.value = video.muted ? 0 : volumValue;
};

const handleVolume = (e) => {
  const volume = e.target.value;
  if (video.muted) {
    video.muted = false;
  }
  volumValue = volume;
  video.volume = volume;
  muteBtnIcon.classList =
    volumValue == 0 ? "fas fa-volume-mute" : "fas fa-volume-up";
};
function forMatTime(time) {
  const ret = new Date(time * 1000).toISOString().substr(14, 5);
  return ret;
}

function handleMetaData() {
  const total = Math.floor(video.duration);
  totalTime.innerText = forMatTime(total);
  timeline.max = total;
}
function handleTimeUpdate() {
  const current = Math.floor(video.currentTime);
  currentTime.innerText = forMatTime(current);
  timeline.value = current;
}
function handleTimeline(e) {
  const value = e.target.value;
  video.currentTime = value;
}
function handleFullScreen(e) {
  const nowFull = document.fullscreenElement;
  if (nowFull) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
}
function handleMouseMove() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsTimeout2) {
    clearTimeout(controlsTimeout2);
    controlsTimeout = null;
  }
  controlsTimeout2 = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
  videoControls.classList.add("showing");
}
function handleMouseLeft() {
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
}
function handlePlayOrPause(e) {
  if (e.keyCode !== 32) {
    return;
  }
  handlePlayClick();
}
if (video.readyState == 4) {
  handleMetaData();
}
function handleEnded() {
  const id = videoContainer.dataset.id;
  fetch(`/api/videos/${id}/vp`, { method: "post" });
}

playBtn.addEventListener("click", handlePlayClick);
mute.addEventListener("click", handleMute);

volume.addEventListener("input", handleVolume);
video.addEventListener("loadeddata", handleMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);

timeline.addEventListener("input", handleTimeline);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeft);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keypress", handlePlayOrPause);
video.addEventListener("ended", handleEnded);
