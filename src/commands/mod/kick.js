module.exports = {
  name: "kick",
  group: true,
  run: async ({ bot, botNumber, lang, message, mentions, types }) => {
    if (!types.isBotAdmins) {
      return bot.sendMessage(message.chat, { text: lang.global.noAdmin }, { quoted: message });
    }
    if (types.isGroupOwners || types.isGroupAdmins) {
      const user = message.mentionedJid?.[0];
      if (!user) {
        return bot.sendMessage(message.chat, { text: lang.global.mention }, { quoted: message });
      }
      if (user === message.sender) {
        return bot.sendMessage(
          message.chat,
          { text: lang.global.mentionSelf },
          { quoted: message },
        );
      }
      if (user === botNumber) {
        return bot.sendMessage(message.chat, { text: lang.global.mentionBot }, { quoted: message });
      }
      if (user === mentions.owners.includes(user)) {
        return bot.sendMessage(
          message.chat,
          { text: lang.global.mentionOwner },
          { quoted: message },
        );
      }
      await bot.groupParticipantsUpdate(message.chat, [user], "remove");
      return bot.sendMessage(message.chat, { text: `${lang.mod.kick}` }, { quoted: message });
    }
    return bot.sendMessage(message.chat, { text: lang.global.noUserAdmin }, { quoted: message });
  },
};
