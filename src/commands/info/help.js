module.exports = {
  name: "help",
  run: async (bot, message, global, args, text) => {
    const txt = `*┏━━━━━━━━━ツ━━━━━━━━━┓*\n  _*⤝  Categories ⤞*_\n  ⟿ ${global.prefix}Information\n  ⟿ ${global.prefix}Interaction\n  ⟿ ${global.prefix}Music\n*┗━━━━━━━━━ツ━━━━━━━━━┛*`;
    bot.sendMessage(message.chat, {text: txt}, {quoted: message});
  },
};
