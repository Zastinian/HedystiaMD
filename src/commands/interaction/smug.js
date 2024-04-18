const { sticker } = require("../../lib/sticker")

module.exports = {
	name: "smug",
	run: async (bot, message, _global, _args, _text, _types) => {
		const sender = message.sender
		const response = await fetch("https://nekos.life/api/v2/img/smug")
		const body = await response.json()
		const image = `${body.url}`
		const stiker = await sticker(
			null,
			image,
			`${bot.getName(sender.replace("@s.whatsapp.net", ""))} is presuming`
		)
		bot.sendFile(m.chat, stiker, null, { asSticker: true })
	},
}
