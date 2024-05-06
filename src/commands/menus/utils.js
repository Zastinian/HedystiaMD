module.exports = {
  name: "utils",
  run: async ({ bot, lang, message }) => {
    bot.sendMessage(message.chat, { text: `${lang.menus.utils}` }, { quoted: message });
  },
};
