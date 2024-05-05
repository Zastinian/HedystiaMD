module.exports = {
  name: "interaction",
  run: async ({ bot, lang, message }) => {
    bot.sendMessage(message.chat, { text: `${lang.menus.interaction}` }, { quoted: message });
  },
};
