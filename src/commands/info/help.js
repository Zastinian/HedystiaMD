module.exports = {
	name: "help",
	run: async (bot, lang, message) => {
		bot.sendMessage(message.chat, { text: `${lang.info.help}` }, { quoted: message });
	},
};
