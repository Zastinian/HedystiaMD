const {Buttons} = require("hedystia.web");

module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menu);
  },
};
