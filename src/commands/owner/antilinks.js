module.exports = {
  name: "antiLinks",
  run: async ({ bot, lang, args, message, types }) => {
    if (!types.isBotOwner) {
      return bot.sendMessage(message.chat, { text: lang.global.noOwner }, { quoted: message });
    }

    let config;

    const subCommand = args[0];
    const subArgs = args.slice(1);

    switch (subCommand) {
      case "enable":
        global.db.config.update("antiLinks", { id: "antiLinks" }, { enabled: true });
        return bot.sendMessage(
          message.chat,
          { text: lang.owner.antiLinks.enabled },
          { quoted: message },
        );

      case "disable":
        global.db.config.update("antiLinks", { id: "antiLinks" }, { enabled: false });
        return bot.sendMessage(
          message.chat,
          { text: lang.owner.antiLinks.disabled },
          { quoted: message },
        );

      case "add": {
        if (!subArgs[0]) {
          return bot.sendMessage(
            message.chat,
            { text: lang.owner.antiLinks.noLink },
            { quoted: message },
          );
        }
        const config = global.db.config.select("antiLinks", { id: "antiLinks" })[0];
        // @ts-ignore
        if (!config.allowed.includes(subArgs[0])) {
          // @ts-ignore
          config.allowed.push(subArgs[0]);
          global.db.config.update("antiLinks", { id: "antiLinks" }, { allowed: config.allowed });
        }
        return bot.sendMessage(
          message.chat,
          { text: `${lang.owner.antiLinks.added} ${subArgs[0]}` },
          { quoted: message },
        );
      }

      case "remove": {
        if (!subArgs[0]) {
          return bot.sendMessage(
            message.chat,
            { text: lang.owner.antiLinks.noLink },
            { quoted: message },
          );
        }
        config = global.db.config.select("antiLinks", { id: "antiLinks" })[0];
        // @ts-ignore
        const index = config.allowed.indexOf(subArgs[0]);
        if (index > -1) {
          // @ts-ignore
          config.allowed.splice(index, 1);
          global.db.config.update("antiLinks", { id: "antiLinks" }, { allowed: config.allowed });
        }
        return bot.sendMessage(
          message.chat,
          { text: `${lang.owner.antiLinks.removed} ${subArgs[0]}` },
          { quoted: message },
        );
      }

      case "action":
        if (!subArgs[0] || !["delete", "warn"].includes(subArgs[0])) {
          return bot.sendMessage(
            message.chat,
            { text: lang.owner.antiLinks.invalidAction },
            { quoted: message },
          );
        }
        global.db.config.update("antiLinks", { id: "antiLinks" }, { action: subArgs[0] });
        return bot.sendMessage(
          message.chat,
          { text: `${lang.owner.antiLinks.actionSet} ${subArgs[0]}` },
          { quoted: message },
        );

      case "list":
        config = global.db.config.select("antiLinks", { id: "antiLinks" })[0];
        // @ts-ignore
        if (!config.allowed || config.allowed.length === 0) {
          return bot.sendMessage(
            message.chat,
            { text: lang.owner.antiLinks.noLinks },
            { quoted: message },
          );
        }
        return bot.sendMessage(
          message.chat,
          // @ts-ignore
          { text: `${lang.owner.antiLinks.list} ${config.allowed.join(", ")}` },
          { quoted: message },
        );

      default:
        return bot.sendMessage(
          message.chat,
          { text: lang.owner.antiLinks.usage },
          { quoted: message },
        );
    }
  },
};
