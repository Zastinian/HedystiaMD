const {Buttons} = require("hedystia.web");

module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    /*const buttons = new Buttons(
      lang.help.menu,
      [
        {body: lang.help.buttons.t1, id: "info_button"},
        {body: lang.help.buttons.t2, id: "music_button"},
        {body: lang.help.buttons.t3, id: "interaction_button"},
      ],
      null,
      "Hedystia | © 2021 - " + new Date().getFullYear()
    );
    await message.reply(buttons);*/
    await message.reply(lang.help.menu_no_buttons);
  },
};
