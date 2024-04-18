module.exports = {
	name: "music",
	run: async (bot, message, global, _args, _text) => {
		const txt = `*┏━━━━━━━━━ツ━━━━━━━━━┓*\n  _*⤝  Music Commands ⤞*_\n  ⟿ ${global.prefix}play\n*┗━━━━━━━━━ツ━━━━━━━━━┛*`
		bot.sendMessage(message.chat, { text: txt }, { quoted: message })
	},
}
