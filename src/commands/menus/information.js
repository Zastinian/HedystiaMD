module.exports = {
	name: "information",
	run: async ({ bot, lang, message }) => {
		bot.sendMessage(message.chat, { text: `${lang.menus.information}` }, { quoted: message });
	},
};
