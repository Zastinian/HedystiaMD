require("./config");

const fs = require("node:fs");

const nsfw = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"));
const rules = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"));
const { getGroupAdmins, getGroupOwners } = require("./src/lib/myfunc");
const antilinks = require("./src/core/antilinks");

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
											: "";
		const budy = typeof m.text == "string" ? m.text : "";
		const itsMe = m.sender === hedystia.user.id;
		if (itsMe) return;

		const botNumber = await hedystia.decodeJid(hedystia.user.id);

		const isGroup = m.isGroup;
		const groupMetadata = isGroup ? await hedystia.groupMetadata(m.chat).catch((e) => {}) : "";
		const participants = isGroup ? await groupMetadata.participants : "";
		const groupOwners = isGroup ? await getGroupOwners(participants) : "";
		const groupAdmins = isGroup ? await getGroupAdmins(participants) : "";
		const isGroupOwners = isGroup ? groupOwners.includes(m.sender) : false;
		const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
		const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;

		const lang = hedystia.lang;
		let cont = true;
		if (isGroup && globalThis.antiLinks.enabled) {
			const { status } = await antilinks(
				hedystia,
				globalThis.antiLinks,
				m,
				body,
				lang,
				isGroupOwners,
				isGroupAdmins,
				isBotAdmins,
			);
			cont = status;
		}
		if (!cont) {
			return;
		}
		const isCmd = body.startsWith(prefix) && body.slice(prefix.length).trim() !== "";
		if (!isCmd) return;
		const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : "";

		const args = body.trim().split(/ +/).slice(1);

		const text = (q = args.join(" "));
		const quoted = m.quoted ? m.quoted : m;
		const mime = (quoted.msg || quoted).mimetype || "";
		const isMedia = /image|video|sticker|audio/.test(mime);

		const isNsfw = isGroup ? nsfw.includes(groupMetadata.id) : false;

		const savedRules = isGroup ? rules.includes(groupMetadata.id) : false;

		const used = process.memoryUsage();

		if (!hedystia.public) {
			if (!m.key.fromMe) return;
		}

		const commandBot = await hedystia.commands.get(command);
		if (!commandBot) return;

		const types = {
			isGroup,
			itsMe,
			isMedia,
			isBotAdmins,
			isGroupOwners,
			isGroupAdmins,
			isNsfw,
			savedRules,
			used,
			budy,
		};

		commandBot.run(hedystia, lang, m, globalThis, args, text, types);
	} catch (err) {}
};
