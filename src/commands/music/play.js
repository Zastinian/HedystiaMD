const {MessageMedia} = require("whatsapp-web.js");
const yts = require("yt-search");
const DownloadYTAudio = require("../../../music");
const downloader = new DownloadYTAudio({
  outputPath: "./tmp",
  ffmpegPath: global.ffmpegPath,
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
        videos.forEach(async (v) => {
          message.reply(lang.play.info);
          const name = `0x${v.videoId}${Date.now()}x0.mp3`;
          await downloader.download(v.videoId, name);
          const media = MessageMedia.fromFilePath("./tmp/" + name);
          await message.reply(media);
        });
      } catch (e) {
        message.reply(lang.play.error);
      }
    }
  },
};
