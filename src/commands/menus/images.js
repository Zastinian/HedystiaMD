module.exports = {
	name: "images",
	run: async ({ bot, lang, message }) => {
		bot.sendMessage(message.chat, { text: `${lang.menus.images}` }, { quoted: message });
	},
};
