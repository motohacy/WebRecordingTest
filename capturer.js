class Capturer {

  constructor() {

    this.onCapture;

    this.videoStream;
    this.captureTimer;

    this.workVideo;
    this.workCanvas;

  }

  async startCaptureImage(interval, compressionRate) {

    this.videoStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    this.workVideo = document.createElement("video");
    this.workVideo.id = "workVideo";
    this.workVideo.style.display = "none";
    document.body.appendChild(this.workVideo);
    this.workVideo.srcObject = this.videoStream;

    this.workCanvas = document.createElement("canvas");
    this.workCanvas.style.display = "none";
    this.workCanvas.id = "workCanvas";
    document.body.appendChild(this.workCanvas);

    this.workVideo.onplaying = () => {
      this.captureTimer = setInterval( () => {

        var workCanvasCtx = this.workCanvas.getContext('2d');
	this.workCanvas.width = this.workVideo.videoWidth;
        this.workCanvas.height = this.workVideo.videoHeight;

        workCanvasCtx.drawImage(this.workVideo, 0, 0, this.workVideo.videoWidth, this.workVideo.videoHeight);
        var imageDataUrl = this.workCanvas.toDataURL('img/jpeg', compressionRate);
       
        var img = new Image;
        img.onload = () => {
          this.onCapture(img);
        }
        img.src = imageDataUrl;

      }, interval);
    }

    this.workVideo.play();
  }

  stopCapture() {
    if(this.captureTimer != null) { 
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }

    if(this.videoStream != null) { this.videoStream.getTracks().forEach(track => track.stop()); }
    if(document.getElementById("workVideo") != null ) { document.getElementById("workVideo").parentNode.removeChild(document.getElementById("workVideo")); }
    if(document.getElementById("workCanvas") != null) { document.getElementById("workCanvas").parentNode.removeChild(document.getElementById("workCanvas")); }

  }

}