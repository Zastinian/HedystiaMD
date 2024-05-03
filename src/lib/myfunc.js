const util = require("node:util");
const { Buffer } = require("node:buffer");
const { proto, getContentType } = require("baileys");
const moment = require("moment-timezone");
const Jimp = require("jimp");

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

exports.unixTimestampSeconds = unixTimestampSeconds;

exports.generateMessageTag = (epoch) => {
	let tag = (0, exports.unixTimestampSeconds)().toString();
	if (epoch) tag += `.--${epoch}`;
	return tag;
};

exports.processTime = (timestamp, now) => {
	return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

exports.getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`;
};

exports.getBuffer = async (url, options) => {
	try {
		options || {};
		const headers = {
			"DNT": 1,
			"Upgrade-Insecure-Request": 1,
		};

		const fetchOptions = {
			headers,
			...options,
		};

		const res = await fetch(url, fetchOptions);
		const data = await res.arrayBuffer();
		return data;
	} catch (err) {
		return err;
	}
};

exports.fetchJson = async (url, options) => {
	try {
		options || {};
		const headers = {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
		};

		const fetchOptions = {
			headers,
			...options,
		};

		const res = await fetch(url, fetchOptions);
		const data = await res.json();
		return data;
	} catch (err) {
		return err;
	}
};

exports.runtime = function (seconds) {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);
	const dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
	const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
	const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
	const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
};

exports.clockString = function (seconds) {
	const h = Number.isNaN(seconds) ? "--" : Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Number.isNaN(seconds) ? "--" : Math.floor((seconds % 3600) / 60);
	const s = Bumber.isNaN(seconds) ? "--" : Math.floor(seconds % 60);
	return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
};

exports.sleep = async (ms) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.isUrl = (url) => {
	return url.match(
		/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi,
	);
};

exports.getTime = (format, date) => {
	if (date) {
		return moment(date).locale("id").format(format);
	} else {
		return moment.tz("America/Sao_Paulo").locale("id").format(format);
	}
};

exports.formatDate = (n, locale = "id") => {
	const d = new Date(n);
	return d.toLocaleDateString(locale, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	});
};

exports.tanggal = (numer) => {
	myMonths = [
		"Januari",
		"Februari",
		"Maret",
		"April",
		"Mei",
		"Juni",
		"Juli",
		"Agustus",
		"September",
		"Oktober",
		"November",
		"Desember",
	];
	myDays = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum’at", "Sabtu"];
	const tgl = new Date(numer);
	const day = tgl.getDate();
	bulan = tgl.getMonth();
	let thisDay = tgl.getDay();
	thisDay = myDays[thisDay];
	const yy = tgl.getYear();
	const year = yy < 1000 ? yy + 1900 : yy;

	return `${thisDay}, ${day} - ${myMonths[bulan]} - ${year}`;
};

exports.jsonformat = (string) => {
	return JSON.stringify(string, null, 2);
};

exports.logic = (check, inp, out) => {
	if (inp.length !== out.length)
		throw new Error("A entrada e a saída devem ter o mesmo comprimento");
	for (const i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
	return null;
};

exports.generateProfilePicture = async (buffer) => {
	const jimp = await Jimp.read(buffer);
	const min = jimp.getWidth();
	const max = jimp.getHeight();
	const cropped = jimp.crop(0, 0, min, max);
	return {
		img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
		preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
	};
};

exports.parseMention = (text = "") => {
	return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => `${v[1]}@s.whatsapp.net`);
};

exports.getGroupOwners = async (participants) => {
	const owners = [];
	await participants
		.filter((u) => u.admin === "superadmin")
		.map((u) => {
			owners.push(u.id);
		});
	return owners;
};

exports.getGroupAdmins = async (participants) => {
	const admins = [];
	await participants
		.filter((u) => u.admin === "admin")
		.map((u) => {
			admins.push(u.id);
		});
	return admins;
};

/**
 * Serialize Message
 * @param {WAConnection} conn
 * @param {object} m
 * @param {store} store
 */
exports.smsg = (conn, m, store) => {
	if (!m) return m;
	const M = proto.WebMessageInfo;
	if (m.key) {
		m.id = m.key.id;
		m.isBaileys = m.id.startsWith("BAE5") && m.id.length === 16;
		m.chat = m.key.remoteJid;
		m.fromMe = m.key.fromMe;
		m.isGroup = m.chat.endsWith("@g.us");
		m.sender = conn.decodeJid(
			(m.fromMe && conn.user.id) || m.participant || m.key.participant || m.chat || "",
		);
		if (m.isGroup) m.participant = conn.decodeJid(m.key.participant) || "";
	}
	if (m.message) {
		m.mtype = getContentType(m.message);
		m.msg =
			m.mtype === "viewOnceMessage"
				? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)]
				: m.message[m.mtype];
		m.body =
			m.message.conversation ||
			m.msg.caption ||
			m.msg.text ||
			(m.mtype === "listResponseMessage" && m.msg.singleSelectReply.selectedRowId) ||
			(m.mtype === "buttonsResponseMessage" && m.msg.selectedButtonId) ||
			(m.mtype === "viewOnceMessage" && m.msg.caption) ||
			m.text;
		const quoted = (m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null);
		m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
		if (m.quoted) {
			let type = getContentType(quoted);
			m.quoted = m.quoted[type];
			if (["productMessage"].includes(type)) {
				type = getContentType(m.quoted);
				m.quoted = m.quoted[type];
			}
			if (typeof m.quoted === "string")
				m.quoted = {
					text: m.quoted,
				};
			m.quoted.mtype = type;
			m.quoted.id = m.msg.contextInfo.stanzaId;
			m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
			m.quoted.isBaileys = m.quoted.id
				? m.quoted.id.startsWith("BAE5") && m.quoted.id.length === 16
				: false;
			m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
			m.quoted.fromMe = m.quoted.sender === (conn.user && conn.user.id);
			m.quoted.text =
				m.quoted.text ||
				m.quoted.caption ||
				m.quoted.conversation ||
				m.quoted.contentText ||
				m.quoted.selectedDisplayText ||
				m.quoted.title ||
				"";
			m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
			m.getQuotedObj = m.getQuotedMessage = async () => {
				if (!m.quoted.id) return false;
				const q = await store.loadMessage(m.chat, m.quoted.id, conn);
				return exports.smsg(conn, q, store);
			};
			const vM = (m.quoted.fakeObj = M.fromObject({
				key: {
					remoteJid: m.quoted.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id,
				},
				message: quoted,
				...(m.isGroup ? { participant: m.quoted.sender } : {}),
			}));

			m.quoted.delete = () => conn.sendMessage(m.quoted.chat, { delete: vM.key });

			/**
			 *
			 * @param {*} jid
			 * @param {*} forceForward
			 * @param {*} options
			 */
			m.quoted.copyNForward = (jid, forceForward = false, options = {}) =>
				conn.copyNForward(jid, vM, forceForward, options);

			m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
		}
	}
	if (m.msg.url) m.download = () => conn.downloadMediaMessage(m.msg);
	m.text =
		m.msg.text ||
		m.msg.caption ||
		m.message.conversation ||
		m.msg.contentText ||
		m.msg.selectedDisplayText ||
		m.msg.title ||
		"";
	/**
	 * Reply to this message
	 * @param {string | object} text
	 * @param {string | false} chatId
	 * @param {object} options
	 */
	m.reply = (text, chatId = m.chat, options = {}) =>
		Buffer.isBuffer(text)
			? conn.sendMedia(chatId, text, "file", "", m, { ...options })
			: conn.sendText(chatId, text, m, { ...options });
	/**
	 * Copy this message
	 */
	m.copy = () => exports.smsg(conn, M.fromObject(M.toObject(m)));

	/**
	 *
	 * @param {*} jid
	 * @param {*} forceForward
	 * @param {*} options
	 */
	m.copyNForward = (jid = m.chat, forceForward = false, options = {}) =>
		conn.copyNForward(jid, m, forceForward, options);

	return m;
};
