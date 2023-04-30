const {MessageMedia} = require("whatsapp-web.js");
const fs = require("fs");
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};

module.exports = {
  name: "play",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await message.reply(lang.play.info2);
    //findYtSong(args.slice(0).join(" "), message);
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
    const vid = getRandom(".mp3");
    if (ytdl.validateURL("https://www.youtube.com/watch?v=QFs3PIZb3js")) {
      ytdl("https://www.youtube.com/watch?v=QFs3PIZb3js", {
        format: "mp3",
        filter: "audioonly",
        quality: "lowest",
      })
        .pipe(fs.createWriteStream(vid))
        .on("finish", async () => {
          try {
            const media = MessageMedia.fromFilePath("./" + vid);
            await message.reply(media);
          } catch (error) {
            //await bot.reply(message.chatId, lang.play.error, message.id);
            //fs.unlinkSync(vid);
          }
        });
    } else {
      return await bot.reply(message.chatId, lang.play.info2, message.id);
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
