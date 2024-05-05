const { sticker } = require("../../lib/sticker");

module.exports = {
	name: "smug",
	run: async (bot, lang, message) => {
		const sender = message.sender;
		const response = await fetch("https://nekos.life/api/v2/img/smug");
		const body = await response.json();
		const image = `${body.url}`;
		const stiker = await sticker(
			null,
			image,
			`${bot.getName(sender.replace("@s.whatsapp.net", ""))} ${lang.interaction.smug}`,
		);
		bot.sendFile(message.chat, stiker, null, { asSticker: true });
	},
};
