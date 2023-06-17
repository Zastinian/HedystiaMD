const {MessageMedia} = require("whatsapp-web.js");
module.exports = {
  name: "slap",
  run: async (bot, message, lang, args) => {
    if (!args[0]) return await message.reply(lang.errors.noUserMention);
    const user = await message.getMentions();
    if (!user) return await message.reply(lang.errors.noUserMention);
    const response = await fetch("https://nekos.life/api/v2/img/slap");
    const body = await response.json();
    let image = `${body.url}`;
    let img = await MessageMedia.fromUrl(image, {unsafeMime: true});
    const fromUser = await bot.getContactById(message.from);
    message.reply(img, undefined, {
      sendMediaAsSticker: true,
      stickerName: fromUser.pushname + ` ${lang.interaction.slap} ` + user[0].pushname,
      stickerAuthor: "Hedystia",
      stickerCategories: ["Interaction", "Fun"],
    });
  },
};
