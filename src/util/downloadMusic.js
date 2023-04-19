const fs = require("fs").promises;
const yts = require("yt-search");
const DownloadYTFile = require("yt-dl-playlist");
const downloader = new DownloadYTFile({
  outputPath: "../../tmp",
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

async function downloadSong(videoID, videoName, msg, bot) {
  try {
    await downloader.download(videoID, `${videoName}`);
    bot.sendMessage(msg.chat, {audio: {url: "../../tmp/"+videoName}, mimetype: "audio/mpeg", fileName: `${videoName}`}, {quoted: msg});
    return ;
  } catch (e) {
    await fs.unlink(`./tmp/${videoName}`);
    const txt = `There was an error downloading or searching for music.`;
    bot.sendMessage(msg.chat, {text: txt}, {quoted: msg});
    return
  }
}

async function sendMusic(msg, bot, songName) {
  const videoID = await findYtSong(songName);
  if (videoID == "No") {
    const txt = `There was an error downloading or searching for music.`;
    bot.sendMessage(msg.chat, {text: txt}, {quoted: msg});
    return
  }
  const videoName = `0x${videoID}x${Date.now()}.mp3`;
  await downloadSong(videoID, videoName, msg, bot);
}

module.exports = sendMusic;
