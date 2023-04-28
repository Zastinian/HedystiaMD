const fs = require("fs").promises;
const yts = require("yt-search");
const DownloadYTFile = require("yt-dl-playlist");
const {MessageMedia} = require("hedystia.web");

const downloader = new DownloadYTFile({
  outputPath: "./tmp",
  ffmpegPath: global.ffmpegPath,
  maxParallelDownload: 1,
  fileNameGenerator: (videoTitle) => {
    return videoTitle;
  },
  maxDownloadSize: 6 * 1024 * 1024,
});

async function findYtSong(songName) {
  try {
    const r = await yts(songName);
    const videos = r.videos.slice(0, 1);
    return videos[0].videoId;
  } catch (e) {
    return "No";
  }
}

async function downloadSong(videoID, videoName, msg) {
  try {
    await downloader.download(videoID, `${videoName}`);
    const media = MessageMedia.fromFilePath("./tmp" + videoName);
    message.reply(media);
    return;
  } catch (e) {
    const txt = `There was an error downloading or searching for music.`;
    msg.reply(txt);
    return;
  }
}

async function sendMusic(songName, message) {
  const videoID = await findYtSong(songName);
  if (videoID == "No") {
    const txt = `There was an error downloading or searching for music.`;
    message.reply(txt);
    return;
  }
  const videoName = `0x${videoID}x${Date.now()}.mp3`;
  await downloadSong(videoID, videoName, message);
}

module.exports = sendMusic;
