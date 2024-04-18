module.exports = {
	name: "information",
	run: async (bot, message, global, _args, _text) => {
		const txt = `*┏━━━━━━━━━━━━ツ━━━━━━━━━━━━┓*\n  _*⤝  Information Commands ⤞*_\n  ⟿ ${global.prefix}help\n*┗━━━━━━━━━━━━ツ━━━━━━━━━━━━┛*`
		bot.sendMessage(message.chat, { text: txt }, { quoted: message })
	},
}
