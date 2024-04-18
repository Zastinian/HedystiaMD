const { sticker } = require("../../lib/sticker")

module.exports = {
	name: "hug",
	run: async (bot, message, _global, args, _text, _types) => {
		if (!args[0])
			return bot.sendMessage(
				message.chat,
				{ text: "You have not mentioned the user" },
				{ quoted: message }
			)
		if (!bot.getName(args[0].replace("@", "")))
			return bot.sendMessage(
				message.chat,
				{ text: "You have not mentioned the user" },
				{ quoted: message }
			)
		const sender = message.sender
		const response = await fetch("https://nekos.life/api/v2/img/hug")
		const body = await response.json()
		const image = `${body.url}`
		const stiker = await sticker(
			null,
			image,
			`${bot.getName(sender.replace("@s.whatsapp.net", ""))} has just embraced ${bot.getName(args[0].replace("@", ""))}`
		)
		bot.sendFile(m.chat, stiker, null, { asSticker: true })
	},
}
