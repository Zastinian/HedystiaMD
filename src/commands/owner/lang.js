module.exports = {
  name: "lang",
  run: async ({ bot, lang, args, message, types }) => {
    if (!types.isBotOwner) {
      return bot.sendMessage(message.chat, { text: lang.global.noOwner }, { quoted: message });
    }
    if (!args[0]) {
      return bot.sendMessage(message.chat, { text: lang.owner.lang.noLang }, { quoted: message });
    }
    const newLang = args[0].toLowerCase();
    if (
      newLang === "english" ||
      newLang === "en" ||
      newLang === "ingles" ||
      newLang === "inglés" ||
      newLang === "español" ||
      newLang === "es" ||
      newLang === "spanish"
    ) {
      let l;
      let n;
      switch (newLang) {
        case "español":
          l = "es";
          n = "Español";
          break;
        case "es":
          l = "es";
          n = "Español";
          break;
        case "spanish":
          l = "es";
          n = "Español";
          break;
        default:
          l = "en";
          n = "English";
          break;
      }
      global.db.config.update("lang", { id: "lang" }, { value: l });
      return bot.sendMessage(
        message.chat,
        { text: `${lang.owner.lang.correct}`.replace("{custom}", n) },
        { quoted: message },
      );
    }
    return bot.sendMessage(
      message.chat,
      {
        text: `${lang.owner.lang.errorExisting}`.replace("{custom}", "english, español"),
      },
      { quoted: message },
    );
  },
};
