module.exports = {
  name: "interaction",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menus.interaction);
  },
};
