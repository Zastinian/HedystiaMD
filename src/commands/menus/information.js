module.exports = {
	name: "information",
	run: async (bot, lang, message, global) => {
		bot.sendMessage(
			message.chat,
			{ text: `${lang.menus.information}`.replaceAll("{0}", global.prefix) },
			{ quoted: message }
		)
	},
}
