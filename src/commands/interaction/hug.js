const { sticker } = require("../../lib/sticker");

module.exports = {
	name: "hug",
	run: async (bot, lang, message, _global, args) => {
		if (!args[0])
			return bot.sendMessage(message.chat, { text: lang.global.mention }, { quoted: message });
		if (!bot.getName(args[0].replace("@", "")))
			return bot.sendMessage(message.chat, { text: lang.global.mention }, { quoted: message });
		const sender = message.sender;
		const response = await fetch("https://nekos.life/api/v2/img/hug");
		const body = await response.json();
		const image = `${body.url}`;
		const stiker = await sticker(
			null,
			image,
			`${bot.getName(sender.replace("@s.whatsapp.net", ""))} ${lang.interaction.hug} ${bot.getName(args[0].replace("@", ""))}`,
		);
		bot.sendFile(message.chat, stiker, null, { asSticker: true });
	},
};
