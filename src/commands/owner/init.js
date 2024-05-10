module.exports = {
  name: "init",
  run: async ({ bot, lang, message }) => {
    global.db.config.update("owner", { id: "owner" }, { value: message.sender });
    return bot.sendMessage(message.chat, { text: lang.owner.defaultOwner }, { quoted: message });
  },
};
