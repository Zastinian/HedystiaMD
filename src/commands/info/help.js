const {Buttons} = require("whatsapp-web.js");

module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menu);
  },
};
