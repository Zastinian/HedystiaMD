const {sticker} = require("../../lib/sticker");

module.exports = {
  name: "slap",
  run: async (bot, message, global, args, text, types) => {
    if (!args[0]) return bot.sendMessage(message.chat, {text: "You have not mentioned the user"}, {quoted: message});
    if (!bot.getName(args[0].replace("@", ""))) return bot.sendMessage(message.chat, {text: "You have not mentioned the user"}, {quoted: message});
    const sender = message.sender;
    const response = await fetch("https://nekos.life/api/v2/img/slap");
    const body = await response.json();
    let image = `${body.url}`;
    let stiker = await sticker(
      null,
      image,
      bot.getName(sender.replace("@s.whatsapp.net", "")) + " just slapped " + bot.getName(args[0].replace("@", ""))
    );
    bot.sendFile(m.chat, stiker, null, {asSticker: true});
  },
};
