module.exports = {
  name: "help",
  run: async (bot, message, global, args, text) => {
    const txt = `*┏━━━━━━━━━ツ━━━━━━━━━┓*\n  _*⤝  Categories ⤞*_\n  ⟿ ${global.prefix}Information\n  ⟿ ${global.prefix}Music\n*┗━━━━━━━━━ツ━━━━━━━━━┛*`;
    let btn = [
      {
        urlButton: {
          displayText: "Website",
          url: "https://mresmile.com",
        },
      },
      //Temporary disable due to whatsapp update
      /*{
        quickReplyButton: {
          displayText: "",
          id: `${global.prefix}`,
        },
      },*/
    ];
    bot.sendMessage(message.chat, {text: txt}, {quoted: message});
    //bot.sendButtonText(message.chat, btn, txt, "Esmile", message);
    //bot.send5ButImg(message.chat, txt, bot.user.name, global.thumb, btn);
  },
};
