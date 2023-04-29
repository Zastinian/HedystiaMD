const {Buttons} = require("hedystia.web");

module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    const buttons = new Buttons(lang.help.menu, [{body: lang.help.buttons.t1, id: "info_button"}], null, null);
    await message.reply(buttons);
  },
};
