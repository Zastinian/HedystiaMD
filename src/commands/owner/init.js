module.exports = {
  name: "init",
  run: async ({ bot, lang, message }) => {
    if (global.db.config.select("owner", { id: "owner" })[0].value) {
      return bot.sendMessage(message.chat, { text: lang.owner.alreadyInit }, { quoted: message });
    }
    global.db.config.update("owner", { id: "owner" }, { value: message.sender });
    return bot.sendMessage(message.chat, { text: lang.owner.defaultOwner }, { quoted: message });
  },
};
