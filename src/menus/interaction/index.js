module.exports = {
  name: "interaction_button",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menus.interaction);
  },
};
