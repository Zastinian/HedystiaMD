import {Message} from "whatsapp-web.js";
import AssClient from "../../assets/Client";
import {Lang} from "../../types/Lang";

export default {
  name: "help",
  run: async (bot: AssClient, message: Message, lang: Lang, args: object[]) => {
    await message.reply(lang.help.menu);
  },
};
