module.exports = {
  name: "interaction",
  run: async (bot, message, global, args, text) => {
    const txt = `*┏━━━━━━━━━━━━ツ━━━━━━━━━━━━┓*\n  _*⤝  Information Commands ⤞*_\n  ⟿ ${global.prefix}feed\n  ⟿ ${global.prefix}hug\n  ⟿ ${global.prefix}kiss\n  ⟿ ${global.prefix}pat\n  ⟿ ${global.prefix}slap\n  ⟿ ${global.prefix}smug\n*┗━━━━━━━━━━━━ツ━━━━━━━━━━━━┛*`;
    bot.sendMessage(message.chat, {text: txt}, {quoted: message});
  },
};
