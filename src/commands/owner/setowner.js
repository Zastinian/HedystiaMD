module.exports = {
  name: "setowner",
  run: async ({ bot, botNumber, lang, message, types }) => {
    if (!types.isBotOwner) {
      return bot.sendMessage(message.chat, { text: lang.global.noOwner }, { quoted: message });
    }
    const user = message.mentionedJid && message.mentionedJid[0];
    if (!user) {
      return bot.sendMessage(message.chat, { text: lang.global.mention }, { quoted: message });
    }
    if (user === message.sender) {
      return bot.sendMessage(message.chat, { text: lang.global.mentionSelf }, { quoted: message });
    }
    if (user === botNumber) {
      return bot.sendMessage(message.chat, { text: lang.global.mentionBot }, { quoted: message });
    }
    global.db.config.update("owner", { id: "owner" }, { value: user });
    return bot.sendMessage(message.chat, { text: lang.owner.newOwner }, { quoted: message });
  },
};
