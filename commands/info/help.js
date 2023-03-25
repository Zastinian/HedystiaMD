const {Buttons} = require("whatsapp-web.js");

module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    const buttons = new Buttons(
      lang.help.menu,
      [
        {id: "info_button", body: lang.help.buttons.t1},
        {id: "music_button", body: lang.help.buttons.t2},
      ],
      null,
      "Esmile | © 2021 - " + new Date().getFullYear()
    );
    await message.reply(buttons);
    bot.on("message_create", async (message) => {
      if (message.type !== "buttons_response") {
        return;
      }
      const {selectedButtonId} = message;
      if (selectedButtonId == "info_button") {
        await bot.sendMessage(message.from, lang.help.menus.info);
      } else if (selectedButtonId == "music_button") {
        await bot.sendMessage(message.from, lang.help.menus.music);
      }
    });
  },
};
