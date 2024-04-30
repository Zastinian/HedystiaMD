module.exports = {
	name: "music",
	run: async (bot, lang, message, global) => {
		bot.sendMessage(
			message.chat,
			{ text: `${lang.menus.music}`.replaceAll("{0}", global.prefix) },
			{ quoted: message },
		);
	},
};
