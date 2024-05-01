module.exports = {
	name: "images",
	run: async (bot, lang, message, global) => {
		bot.sendMessage(
			message.chat,
			{ text: `${lang.menus.images}`.replaceAll("{0}", global.prefix) },
			{ quoted: message },
		);
	},
};
