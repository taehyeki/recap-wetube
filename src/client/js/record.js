import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");
const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

let stream;
let recorder;
let videoUrl;

const handleDownload = async () => {
  startBtn.innerText = "converting...";
  startBtn.disabled = true;
  if (!ffmpeg.isLoaded()) await ffmpeg.load();

  ffmpeg.FS("writeFile", "my.webm", await fetchFile(videoUrl));
  await ffmpeg.run("-i", "my.webm", "-r", "60", "my.mp4");
  await ffmpeg.run(
    "-i",
    "my.mp4",
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    "myThumb.jpg"
  );
  const mp4File = ffmpeg.FS("readFile", "my.mp4");
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const mp4Url = URL.createObjectURL(mp4Blob);
  const a = document.createElement("a");
  a.href = mp4Url;
  document.body.appendChild(a);
  a.download = "my.mp4";
  a.click();

  const ThumbFile = ffmpeg.FS("readFile", "myThumb.jpg");
  const ThumbBlob = new Blob([ThumbFile.buffer], { type: "image/jpg" });
  const ThumbUrl = URL.createObjectURL(ThumbBlob);
  const Thumba = document.createElement("a");
  Thumba.href = ThumbUrl;
  document.body.appendChild(Thumba);
  Thumba.download = "myThumb.jpg";
  Thumba.click();

  ffmpeg.FS("unlink", "my.webm");
  ffmpeg.FS("unlink", "my.mp4");
  ffmpeg.FS("unlink", "myThumb.jpg");

  URL.revokeObjectURL(videoUrl);
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(ThumbUrl);
  startBtn.innerText = "record again !";
  startBtn.disabled = false;
  video.src = null;
  video.srcObject = stream;

  video.play();
  startBtn.removeEventListener("click", handleDownload);
  startBtn.addEventListener("click", handleStart);
};

const handleStart = () => {
  startBtn.removeEventListener("click", handleStart);

  startBtn.innerText = "Recording";
  startBtn.disabled = true;

  recorder = new MediaRecorder(stream);
  recorder.addEventListener("dataavailable", (e) => {
    videoUrl = URL.createObjectURL(e.data);
    video.srcObject = null;
    video.src = videoUrl;
    video.play();
    video.loop = true;
    startBtn.innerText = "Download";
    startBtn.disabled = false;
    startBtn.addEventListener("click", handleDownload);
  });
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 3000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};
init();

startBtn.addEventListener("click", handleStart);
