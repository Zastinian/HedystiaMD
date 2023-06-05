module.exports = {
  name: "information",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menus.info);
  },
};
