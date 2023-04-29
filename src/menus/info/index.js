module.exports = {
  name: "info_button",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menus.info);
  },
};
