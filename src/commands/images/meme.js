const { sticker } = require("../../lib/sticker");
const memes = require("../../util/memes");

module.exports = {
	name: "meme",
	run: async (bot, lang, message, global) => {
		const meme = await memes({
			locale: global.lang,
			customSubredditName: false,
		});
		bot.sendMessage(message.chat, { text: `${lang.images.meme}` }, { quoted: message });
		const stiker = await sticker(null, meme.image, meme.caption);
		bot.sendFile(message.chat, stiker, null, { asSticker: true });
	},
};
