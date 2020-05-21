class Recorder {

  constructor() {

    this.isDebug = true;
    this.mediaRecorder;
    this.videoStream;
    this.audioStream;
    this.combinedStream;

  }

  start() {

    this.debug("recording start.");
    this.startRecording();

  }

  async startRecording() {

    this.videoStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });

    this.audioStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    });

    this.combinedStream = new MediaStream([...this.videoStream.getTracks(), ...this.audioStream.getTracks()])
    this.mediaRecorder = new MediaRecorder(this.combinedStream, { mimeType: 'video/webm;codecs=h264' })

    this.mediaRecorder.ondataavailable = (event) => {

      if (event.data && event.data.size > 0) {

        this.debug("dataavailable called.")
        this.download(new Blob([event.data], { type: event.data.type }));
      }
    }
   
    this.mediaRecorder.start();

  }

  stopRecording() {

     if(this.combinedStream != null) { this.combinedStream.getTracks().forEach(track => track.stop());}
     if(this.audioStream != null) { this.audioStream.getTracks().forEach(track => track.stop());}
     if(this.videoStream != null) { this.videoStream.getTracks().forEach(track => track.stop());}
     if(this.mediaRecorder != null && this.mediaRecorder.state != "inactive") { this.mediaRecorder.stop();}
  }

  createFileName() {

    var fileName;
    var date = new Date();
    return "recorded-" + date.getFullYear() + ("00" + (date.getMonth()+1)).slice(-2) + ("00" + date.getDate()).slice(-2) + "-" + ("00" + date.getHours()).slice(-2) + ("00" + date.getMinutes()).slice(-2) + ("00" + date.getSeconds()).slice(-2) + ".webm";

  }

  download(videoBlob) {

    var blobUrl = window.URL.createObjectURL(videoBlob);
    var downloader = document.createElement("a");
    downloader.style.display ="none";
    downloader.download = this.createFileName();
    downloader.href = blobUrl;
    downloader.click();
    videoBlob = null;
    blobUrl = null;
  }

  debug(message) {

    if(this.isDebug) {
    	console.log(message);
    }
  }

}