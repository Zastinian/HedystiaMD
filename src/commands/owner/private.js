module.exports = {
  name: "lang",
  run: async ({ bot, lang, args, message, types }) => {
    if (!types.isBotOwner) {
      return bot.sendMessage(message.chat, { text: lang.global.noOwner }, { quoted: message });
    }
    if (!args[0]) {
      return bot.sendMessage(
        message.chat,
        { text: lang.owner.private.noPrivate },
        { quoted: message },
      );
    }
    const newPrivateStatus = args[0].toLowerCase();
    if (
      newPrivateStatus === "true" ||
      newPrivateStatus === "on" ||
      newPrivateStatus === "encendido" ||
      newPrivateStatus === "enabled" ||
      newPrivateStatus === "false" ||
      newPrivateStatus === "off" ||
      newPrivateStatus === "apagado" ||
      newPrivateStatus === "desactivado" ||
      newPrivateStatus === "disabled"
    ) {
      let l;
      let n;
      switch (newPrivateStatus) {
        case "true":
          l = true;
          n = "True";
          break;
        case "on":
          l = true;
          n = "True";
          break;
        case "enabled":
          l = true;
          n = "True";
          break;
        case "false":
          l = false;
          n = "False";
          break;
        case "off":
          l = false;
          n = "False";
          break;
        case "apagado":
          l = false;
          n = "False";
          break;
        case "desactivado":
          l = false;
          n = "False";
          break;
        case "disabled":
          l = false;
          n = "False";
          break;
      }
      global.db.config.update("private", { id: "private" }, { value: l });
      return bot.sendMessage(
        message.chat,
        { text: `${lang.owner.private.correct}`.replace("{custom}", n) },
        { quoted: message },
      );
    }
    return bot.sendMessage(
      message.chat,
      {
        text: `${lang.owner.private.errorExisting}`.replace("{custom}", "true, false"),
      },
      { quoted: message },
    );
  },
};
