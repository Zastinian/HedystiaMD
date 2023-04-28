module.exports = {
  name: "help",
  run: async (bot, message, lang, args) => {
    await message.reply(
      `*┏━━━━━━━━━ツ━━━━━━━━━┓*\n  _*⤝  Categories ⤞*_\n  ⟿ ${global.prefix}Information\n  ⟿ ${global.prefix}Interaction\n  ⟿ ${global.prefix}Music\n*┗━━━━━━━━━ツ━━━━━━━━━┛*`
    );
  },
};
