module.exports = {
  name: "info",
  run: async ({ bot, lang, message }) => {
    bot.sendMessage(message.chat, { text: `${lang.info.info}` }, { quoted: message });
  },
};
