module.exports = {
	name: "help",
	run: async (bot, lang, message, global, _args, _text) => {
		bot.sendMessage(
			message.chat,
			{ text: `${lang.info.help}`.replaceAll("{0}", global.prefix) },
			{ quoted: message },
		);
	},
};
