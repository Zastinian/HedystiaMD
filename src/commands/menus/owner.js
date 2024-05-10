module.exports = {
  name: "owner",
  run: async ({ bot, lang, message }) => {
    bot.sendMessage(message.chat, { text: `${lang.menus.owner}` }, { quoted: message });
  },
};
