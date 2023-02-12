const fs = require("fs");
const ytdl = require("ytdl-core");
const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};
module.exports = {
  name: "play",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await bot.reply(message.chatId, lang.play.info2, message.id);
    const url = args.join(" ");
    const vid = getRandom(".mp3");
    if (ytdl.validateURL(url)) {
      await bot.reply(message.chatId, lang.play.info, message.id);
      ytdl(url, {
        format: "mp3",
        filter: "audioonly",
        quality: "lowest",
      })
        .pipe(fs.createWriteStream(vid))
        .on("finish", async () => {
          try {
            await bot.sendPtt(message.chatId, vid, message.id).then(async () => {
              await bot.reply(message.chatId, lang.play.info3, message.id);
              fs.unlinkSync(vid);
            });
          } catch (error) {
            await bot.reply(message.chatId, lang.play.error, message.id);
            fs.unlinkSync(vid);
          }
        });
    } else {
      return await bot.reply(message.chatId, lang.play.info2, message.id);
    }
  },
};
