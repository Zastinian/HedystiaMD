import {MessageMedia, Message} from "whatsapp-web.js";
import AssClient from "../../assets/Client";
import {Lang} from "../../types/Lang";

export default {
  name: "slap",
  run: async (bot: AssClient, message: Message, lang: Lang, args: object[]) => {
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
