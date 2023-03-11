const music = require("../../music");

module.exports = {
  name: "play",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await message.reply(lang.play.info2);
    music(args.slice(0).join(" "), message, lang);
  },
};
