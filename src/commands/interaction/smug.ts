import {MessageMedia, Message} from "whatsapp-web.js";
import AssClient from "../../assets/Client";
import {Lang} from "../../types/Lang";

export default {
  name: "smug",
  run: async (bot: AssClient, message: Message, lang: Lang, args: object[]) => {
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
