module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    await bot.reply(message.chatId, lang.help.info, message.id);
  },
};
