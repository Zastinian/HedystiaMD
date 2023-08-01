"use strict";

import {once, EventEmitter} from "events";
import path from "path";
import ytdl, {Author} from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";

const YOUTUBE_URL = "http://youtube.com/watch?v=";

class DownloadYTAudio extends EventEmitter {
  downloadPath: string;
  nameGenerator: string | ((title: string) => string);
  maxParallelDownload: number;
  constructor(opts: {outputPath: string; fileNameGenerator: string | ((title: string) => string); maxParallelDownload: number; ffmpegPath: string}) {
    super();
    this.downloadPath = opts.outputPath || process.cwd();
    this.nameGenerator = opts.fileNameGenerator || ((title: string) => `${title.replace(/[\\/:*?"<>|]/g, "")}.mp3`);
    this.maxParallelDownload = opts.maxParallelDownload || 10;

    if (opts.ffmpegPath) {
      process.nextTick(() => {
        ffmpeg.setFfmpegPath(opts.ffmpegPath);
      });
    }
  }

  async download(videoId: string, fileName: string) {
    const url = `${YOUTUBE_URL}${videoId}`;
    const videoStream = ytdl(url, {
      filter: "audioonly",
      quality: "lowestaudio",
    });

    const [extendedVideoInfo, videoSetting] = await once(videoStream, "info");
    const videoInfo = extendedVideoInfo.videoDetails;

    const info = {
      id: videoId,
      fileName,
      path: this.downloadPath,
      filePath: path.join(this.downloadPath, fileName),
      ref: buildVideoRef(videoInfo),
    };

    this.emit("video-info", info, videoInfo);
    this.emit("video-setting", info, videoSetting);

    let theResolve: Function | null;
    let theReject: Function | null;
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

  async getVideoInfo(videoId: string) {
    const url = `${YOUTUBE_URL}${videoId}`;
    const advData = await ytdl.getBasicInfo(url);
    if (advData.formats.length === 0) {
      throw new Error("This video is unavailable");
    }

    return buildVideoRef(advData.videoDetails);
  }
}

export default DownloadYTAudio;

function buildVideoRef(advData: {videoId: string; video_url: string; title: string; thumbnails: object[]; lengthSeconds: string; author: Author}) {
  return {
    id: advData.videoId,
    url: advData.video_url,
    title: advData.title,
    thumbnail: advData.thumbnails.reduce(getBigger),
    duration: +Number(advData.lengthSeconds),
    author: advData.author,
  };
}

function getBigger(a: {width: number} | any, b: {width: number} | any) {
  return a.width > b.width ? a : b;
}
