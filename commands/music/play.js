const {MessageMedia} = require("whatsapp-web.js");
const fs = require("fs");
const yts = require("yt-search");
const DownloadYTFile = require("yt-dl-playlist");
const downloader = new DownloadYTFile({
  outputPath: "./tmp",
  ffmpegPath: "/usr/bin/ffmpeg",
  maxParallelDownload: 1,
  fileNameGenerator: (videoTitle) => {
    return videoTitle;
  },
});

module.exports = {
  name: "play",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await message.reply(lang.play.info2);
    findYtSong(args.slice(0).join(" "), message);
    async function findYtSong(songName, message) {
      try {
        const r = await yts(songName);
        const videos = r.videos.slice(0, 1);
        videos.forEach(function (v) {
          downloadSong(v.videoId, v.title, message);
        });
      } catch (e) {
        message.reply(lang.play.error2);
      }
    }
    async function downloadSong(videoID, songName, message) {
      try {
        message.reply(lang.play.info);
        await downloader.download(videoID, `${videoID}.mp3`);
        const media = MessageMedia.fromFilePath("./tmp/" + videoID + ".mp3");
        await message.reply(media);
        fs.unlinkSync("./tmp/" + videoID + ".mp3");
      } catch (e) {
        fs.unlinkSync("./tmp/" + videoID + ".mp3");
        message.reply(lang.play.error);
      }
    }
  },
};
