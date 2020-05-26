class Recorder {

  constructor() {

    this.isDebug = true;
    this.mediaRecorder;
    this.videoStream;
    this.audioStream;
    this.combinedStream;
    this.saveMode;
    this.fileHandle;
    this.writer;
    this.videoSize;
    this.sliceMs;
    this.saveStatus;
    this.SAVE_STATUS_END = 0;

    this.SAVEMODE_FILESYSTEM = 1;
    this.SAVEMODE_DOWNLOAD = 2;

  }

  start(sliceMS, saveMode) {

    this.sliceMs = sliceMS;
    this.saveMode = saveMode;
    this.saveStatus = null;
    this.videoSize = 0;
    this.debug("recording start.");
    this.debug("saveMode:" + this.saveMode);
    this.debug("sliceMs:" + this.sliceMs);
    if(this.saveMode == this.SAVEMODE_FILESYSTEM) {
      if (!window.chooseFileSystemEntries) {
        this.debug("Native File System is unavailable");
        this.saveMode = this.SAVEMODE_DOWNLOAD;
      }
      this.saveFile(null);
    }
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

      this.debug("mediaRecorder.ondataavailable");
      if (event.data && event.data.size > 0) {
        this.save(new Blob([event.data], { type: event.data.type }));
      }
    }

    this.mediaRecorder.start(this.sliceMs);

  }

  async stopRecording() {

     this.SAVE_STATUS = this.SAVE_STATUS_END;

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

  save(videoBlob) {

    if(this.saveMode == this.SAVEMODE_FILESYSTEM) {
      this.saveFile(videoBlob);
    } else {
      this.download(videoBlob);
    }
  }

  async saveFile(content) {

    const saveFileOptions = {
      type: 'save-file',
      accepts: [{
        description: 'WebM file',
        mimeTypes: ['video/webm'],
        extensions: ['webm'],
      }],
    };

    if(this.fileHandle == null) {
      this.fileHandle = await window.chooseFileSystemEntries(saveFileOptions);
      this.writer = await this.fileHandle.createWritable();
    }
  
    if(content == null) {
      await this.writer.truncate(0);
    }  else {
      //await this.writer.seek(this.writer.length);
      this.debug("contentSize:" + content.size);
      this.videoSize = this.videoSize + content.size;
      this.debug("totalSize:" + this.videoSize);
      await this.writer.write(content);
    }
  
    if(this.SAVE_STATUS == this.SAVE_STATUS_END) {
      await this.writer.close();
      this.writer = null;
      if(this.fileHandle != null) { 
           this.fileHandle = null;
           this.videoSize = 0;
           this.debug("fileHandle close.");
      }
    }

  }

  download(videoBlob) {

    this.debug("saveMode:downloadFile");

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