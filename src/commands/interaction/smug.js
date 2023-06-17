const {MessageMedia} = require("whatsapp-web.js");
module.exports = {
  name: "smug",
  run: async (bot, message, lang, args) => {
    const response = await fetch("https://nekos.life/api/v2/img/smug");
    const body = await response.json();
    let image = `${body.url}`;
    let img = await MessageMedia.fromUrl(image, {unsafeMime: true});
    const fromUser = await bot.getContactById(message.from);
    message.reply(img, undefined, {
      sendMediaAsSticker: true,
      stickerName: fromUser.pushname + ` ${lang.interaction.smug}`,
      stickerAuthor: "Hedystia",
      stickerCategories: ["Interaction", "Fun"],
    });
  },
};
