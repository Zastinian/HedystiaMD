module.exports = {
  name: "hidetag",
  run: async ({ bot, botNumber, text, message, group }) => {
    const participants = await group.participants;
    const users = participants.filter((v) => v.id !== botNumber).map((u) => bot.decodeJid(u.id));
    bot.sendMessage(message.chat, { text: `${text.length <= 0 ? "Hi!" : text}`, mentions: users });
  },
};
