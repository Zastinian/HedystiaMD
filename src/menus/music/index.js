module.exports = {
  name: "music_button",
  run: async (bot, message, lang, args) => {
    await message.reply(lang.help.menus.music);
  },
};
