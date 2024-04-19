require("./config")

const fs = require("node:fs")

const nsfw = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"))
const rules = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"))
const { getGroupAdmins } = require("./src/lib/myfunc")

module.exports = hedystia = async (hedystia, m, _chatUpdate, _store) => {
	try {
		const body =
			m.mtype === "conversation"
				? m.message.conversation
				: m.mtype === "imageMessage"
					? m.message.imageMessage.caption
					: m.mtype === "videoMessage"
						? m.message.videoMessage.caption
						: m.mtype === "extendedTextMessage"
							? m.message.extendedTextMessage.text
							: m.mtype === "buttonsResponseMessage"
								? m.message.buttonsResponseMessage.selectedButtonId
								: m.mtype === "listResponseMessage"
									? m.message.listResponseMessage.singleSelectReply.selectedRowId
									: m.mtype === "templateButtonReplyMessage"
										? m.message.templateButtonReplyMessage.selectedId
										: m.mtype === "messageContextInfo"
											? m.message.buttonsResponseMessage?.selectedButtonId ||
												m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
												m.text
											: ""
		const budy = typeof m.text == "string" ? m.text : ""
		const isCmd = prefix.includes(body !== "" && body.slice(0, 1)) && body.slice(1) !== ""
		if (!isCmd) return
		const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : ""

		const args = body.trim().split(/ +/).slice(1)
		const botNumber = await hedystia.decodeJid(hedystia.user.id)

		const itsMe = m.sender === hedystia.user.id
		const text = (q = args.join(" "))
		const quoted = m.quoted ? m.quoted : m
		const mime = (quoted.msg || quoted).mimetype || ""
		const isMedia = /image|video|sticker|audio/.test(mime)

		const groupMetadata = m.isGroup ? await hedystia.groupMetadata(m.chat).catch((e) => {}) : ""
		const participants = m.isGroup ? await groupMetadata.participants : ""
		const groupAdmins = m.isGroup ? getGroupAdmins(participants) : ""
		const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
		const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false

		const isNsfw = m.isGroup ? nsfw.includes(groupMetadata.id) : false

		const savedRules = m.isGroup ? rules.includes(groupMetadata.id) : false

		const used = process.memoryUsage()

		if (!hedystia.public) {
			if (!m.key.fromMe) return
		}

		const commandBot = await hedystia.commands.get(command)
		if (!commandBot) return

		const types = {
			itsMe,
			isMedia,
			isBotAdmins,
			isGroupAdmins,
			isNsfw,
			savedRules,
			used,
			budy,
		}

		const lang = require(`./src/lang/${globalThis.lang}/bot.json`)

		commandBot.run(hedystia, lang, m, globalThis, args, text, types)
	} catch (err) {}
}
