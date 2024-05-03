const links = require("../util/links");

module.exports = async (bot, settings, message, content, lang, isOwner, isAdmin, isBotAdmin) => {
	if (isOwner) return { status: true };
	if (settings.admins_allowed && isAdmin) return { status: true };
	let msg = content;
	await settings.allowed.map((link) => {
		msg = msg.replaceAll(link, "");
	});
	if (!links.some((word) => msg.toLowerCase().includes(word))) return { status: true };
	if (!isBotAdmin) {
		await bot.sendMessage(message.chat, { text: `${lang.automod.antilinks}` }, { quoted: message });
	} else {
		switch (settings.action) {
			case "kick":
				await bot.sendMessage(m.chat, { delete: m.key });
				await bot.groupParticipantsUpdate(m.chat, [m.sender], "remove");
				break;
			default:
				await bot.sendMessage(m.chat, { delete: m.key });
				break;
		}
	}
	return { status: false };
};
