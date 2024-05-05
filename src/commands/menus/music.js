module.exports = {
	name: "music",
	run: async ({ bot, lang, message }) => {
		bot.sendMessage(message.chat, { text: `${lang.menus.music}` }, { quoted: message });
	},
};
