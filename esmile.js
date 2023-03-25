require("./config");

const fs = require("fs");
const util = require("util");

const commands = new Map();

const nsfw = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"));
const rules = JSON.parse(fs.readFileSync("./src/assets/nsfw.json"));

const {getGroupAdmins} = require("./src/lib/myfunc");

const loadCommands = require("./handlers/loadCommands");

module.exports = esmile = async (esmile, m, chatUpdate, store) => {
  try {
    var body =
      m.mtype === "conversation"
        ? m.message.conversation
        : m.mtype == "imageMessage"
        ? m.message.imageMessage.caption
        : m.mtype == "videoMessage"
        ? m.message.videoMessage.caption
        : m.mtype == "extendedTextMessage"
        ? m.message.extendedTextMessage.text
        : m.mtype == "buttonsResponseMessage"
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.mtype == "listResponseMessage"
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.mtype == "templateButtonReplyMessage"
        ? m.message.templateButtonReplyMessage.selectedId
        : m.mtype === "messageContextInfo"
        ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text
        : "";
    var budy = typeof m.text == "string" ? m.text : "";

    const isCmd = prefix.includes(body != "" && body.slice(0, 1)) && body.slice(1) != "";
    if (!isCmd) return;
    esmile.commands = commands;
    loadCommands(esmile);
    const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : "";

    const args = body.trim().split(/ +/).slice(1);
    const botNumber = await esmile.decodeJid(esmile.user.id);

    const itsMe = m.sender == esmile.user.id ? true : false;
    const text = (q = args.join(" "));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);

    const groupMetadata = m.isGroup ? await esmile.groupMetadata(m.chat).catch((e) => {}) : "";
    const participants = m.isGroup ? await groupMetadata.participants : "";
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : "";
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false;
    const isGroupAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

    const isNsfw = m.isGroup ? nsfw.includes(groupMetadata.id) : false;

    const savedRules = m.isGroup ? rules.includes(groupMetadata.id) : false;

    const used = process.memoryUsage();

    if (!esmile.public) {
      if (!m.key.fromMe) return;
    }

    const commandBot = await esmile.commands.get(command);
    if (!commandBot) return;

    const types = {
      itsMe,
      isMedia,
      isBotAdmins,
      isGroupAdmins,
      isNsfw,
      savedRules,
      used,
      budy,
    };

    commandBot.run(esmile, m, global, args, text, types);
  } catch (err) {
    m.reply(util.format(err));
  }
};
