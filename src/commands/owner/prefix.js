module.exports = {
  name: "prefix",
  run: async ({ bot, lang, args, message, types }) => {
    if (!types.isBotOwner) {
      return bot.sendMessage(message.chat, { text: lang.global.noOwner }, { quoted: message });
    }
    if (!args[0]) {
      return bot.sendMessage(
        message.chat,
        { text: lang.owner.prefix.noPrefix },
        { quoted: message },
      );
    }
    if (args[0].length > 6) {
      return bot.sendMessage(
        message.chat,
        { text: lang.owner.prefix.errorLength },
        { quoted: message },
      );
    }
    global.db.config.update("prefix", { id: "prefix" }, { value: args[0] });
    return bot.sendMessage(
      message.chat,
      { text: `${lang.owner.prefix.correct}`.replace("{custom}", args[0]) },
      { quoted: message },
    );
  },
};
