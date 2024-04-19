const { sticker } = require("../../lib/sticker")
const memes = require("../../util/memes")

module.exports = {
	name: "meme",
	run: async (bot) => {
		const meme = await memes({ locale: "en", customSubredditName: false, fullRawBody: false })
		const stiker = await sticker(null, meme.image, meme.caption)
		bot.sendFile(m.chat, stiker, null, { asSticker: true })
	},
}
