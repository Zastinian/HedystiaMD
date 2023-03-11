const music = require("../../music");

module.exports = {
  name: "play",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await message.reply(lang.play.info2);
    message.reply(lang.play.info);
    music(args.slice(0).join(" "), message);
  },
};
