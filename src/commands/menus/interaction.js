module.exports = {
	name: "interaction",
	run: async (bot, lang, message, global) => {
		bot.sendMessage(
			message.chat,
			{ text: `${lang.menus.interaction}`.replaceAll("{0}", global.prefix) },
			{ quoted: message }
		)
	},
}
