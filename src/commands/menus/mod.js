module.exports = {
  name: "mod",
  run: async ({ bot, lang, message }) => {
    bot.sendMessage(message.chat, { text: `${lang.menus.mod}` }, { quoted: message });
  },
};
