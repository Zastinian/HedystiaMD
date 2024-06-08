const { getGroupAdmins, getGroupOwners } = require("./src/lib/myfunc");
const antilinks = require("./src/core/antilinks");
const packageData = require("./package.json");

module.exports = async (hedystia, m) => {
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
    const budy = typeof m.text === "string" ? m.text : "";
    const itsMe = m.sender === hedystia.user.id;
    if (itsMe) return;

    const botNumber = await hedystia.decodeJid(hedystia.user.id);

    const owner = globalThis.db.config.select("owner", { id: "owner" })[0].value;
    const isGroup = m.isGroup;
    const groupMetadata = isGroup ? await hedystia.groupMetadata(m.chat).catch(() => {}) : "";
    const participants = isGroup ? await groupMetadata.participants : "";
    const groupOwners = isGroup ? await getGroupOwners(participants) : "";
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : "";
    const isGroupOwners = isGroup ? groupOwners.includes(m.sender) : false;
    const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
    const isBotOwner = m.sender === owner;
    const prefix = globalThis.db.config.select("prefix", { id: "prefix" })[0].value;

    const categories = {
      owner: "",
      images: "",
      info: "",
      interaction: "",
      menus: "",
      mod: "",
      utils: "",
    };

    for (const command of hedystia.commandsFolder) {
      categories[command.folder] += `\\n  ⟿ ${prefix}${command.name}`;
    }

    const lang = JSON.parse(
      `${JSON.stringify(
        hedystia.langs[globalThis.db.config.select("lang", { id: "lang" })[0].value],
      )}`
        .replace("{0}", categories.menus)
        .replace("{1}", categories.images)
        .replace("{2}", categories.info)
        .replace("{3}", categories.interaction)
        .replace("{4}", categories.mod)
        .replace("{5}", categories.utils)
        .replaceAll("{6}", prefix)
        .replaceAll("{7}", packageData.version)
        .replaceAll("{8}", categories.owner),
    );

    let cont = true;
    if (isGroup) {
      const antiLinks = globalThis.db.config.select("antiLinks", { id: "antiLinks" })[0];
      if (antiLinks.enabled) {
        const { status } = await antilinks(
          hedystia,
          antiLinks,
          m,
          body,
          lang,
          isGroupOwners,
          isGroupAdmins,
          isBotAdmins,
        );
        cont = status;
      }
    }
    if (!cont) {
      return;
    }
    const isCmd = body.startsWith(prefix) && body.slice(prefix.length).trim() !== "";
    if (!isCmd) return;

    const command = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : "";

    if (!owner && command !== "init") {
      return hedystia.sendMessage(m.chat, { text: lang.owner.noOwner }, { quoted: m });
    }

    const args = body.trim().split(/ +/).slice(1);

    const text = args.join(" ");
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);

    const used = process.memoryUsage();

    if (!hedystia.public) {
      if (!m.key.fromMe) return;
    }

    const commandBot = await hedystia.commands.get(command);
    if (!commandBot) return;

    if (commandBot.group && !isGroup) {
      return hedystia.sendMessage(m.chat, { text: lang.owner.noGroup }, { quoted: m });
    }

    const types = {
      isGroup,
      itsMe,
      isMedia,
      isBotAdmins,
      isBotOwner,
      isGroupOwners,
      isGroupAdmins,
      used,
      budy,
    };

    commandBot.run({
      bot: hedystia,
      botNumber,
      lang,
      message: m,
      global: globalThis,
      group: groupMetadata,
      mentions: {
        owners: groupOwners,
        admins: groupAdmins,
      },
      args,
      text,
      types,
    });
  } catch {}
};
