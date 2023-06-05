"use strict";

const {once, EventEmitter} = require("events");
const path = require("path");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const YOUTUBE_URL = "http://youtube.com/watch?v=";

class DownloadYTAudio extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.downloadPath = opts.outputPath || process.cwd();
    this.nameGenerator = opts.fileNameGenerator || ((title) => `${title.replace(/[\\/:*?"<>|]/g, "")}.mp3`);
    this.maxParallelDownload = opts.maxParallelDownload || 10;

    if (opts.ffmpegPath) {
      process.nextTick(() => {
        ffmpeg.setFfmpegPath(opts.ffmpegPath);
      });
    }
  }

  async download(videoId, fileName) {
    const url = `${YOUTUBE_URL}${videoId}`;
    const videoStream = ytdl(url, {
      format: "mp3",
      filter: "audioonly",
      quality: "lowestaudio",
    });

    const [extendedVideoInfo, videoSetting] = await once(videoStream, "info");
    const videoInfo = extendedVideoInfo.videoDetails;

    if (!fileName) {
      fileName = this.nameGenerator(videoInfo.title);
    }

    const info = {
      id: videoId,
      fileName,
      path: this.downloadPath,
      filePath: path.join(this.downloadPath, fileName),
      ref: buildVideoRef(videoInfo),
    };

    this.emit("video-info", info, videoInfo);
    this.emit("video-setting", info, videoSetting);

    let theResolve;
    let theReject;
    const thePromise = new Promise((resolve, reject) => {
      theResolve = resolve;
      theReject = reject;
    });

    const command = ffmpeg(videoStream, {
      stdoutLines: 0,
    })
      .format("mp3")
      .audioBitrate(128)
      .output(info.filePath)
      .on("start", () => {
        this.emit("start", info);
      })
      .on("end", () => {
        this.emit("complete", info);
        if (theResolve) {
          theResolve(info);
          theReject = null;
        }
      })
      .on("error", (err) => {
        this.emit("error", err, info);
        if (theReject) {
          theReject(err);
          theResolve = null;
        }
      })
      .on("progress", (progress) => {
        const update = {...info, progress};
        this.emit("progress", update);
      });

    process.nextTick(() => {
      command.run();
    });

    return thePromise;
  }

  async getVideoInfo(videoId) {
    const url = `${YOUTUBE_URL}${videoId}`;
    const advData = await ytdl.getBasicInfo(url);
    if (advData.formats.length === 0) {
      throw new Error("This video is unavailable");
    }

    return buildVideoRef(advData.videoDetails);
  }
}

module.exports = DownloadYTAudio;

function buildVideoRef(advData) {
  return {
    id: advData.videoId,
    url: advData.video_url,
    title: advData.title,
    thumbnail: advData.thumbnails.reduce(getBigger),
    duration: +advData.lengthSeconds,
    author: advData.author,
  };
}

function getBigger(a, b) {
  return a.width > b.width ? a : b;
}
