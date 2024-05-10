require("./config");
const fs = require("node:fs");
const path = require("node:path");
const { Buffer } = require("node:buffer");
const {
  default: hedystiaConnect,
  useMultiFileAuthState,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
} = require("baileys");
const pino = require("pino");
const FileType = require("file-type");
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./src/lib/exif");
const { smsg, getBuffer, sleep } = require("./src/lib/myfunc");
const { toAudio } = require("./src/lib/converter");

const commands = new Map();
const commandsFolder = new Map();

try {
  async function startHedystia() {
    await globalThis.db.executeDBCode;

    const store = makeInMemoryStore({ logger: pino({ level: "silent" }) });
    store?.readFromFile("./hedystia.json");

    Object.values(store.messages).forEach((m) => m.clear());

    fs.readdir("./hedystia", (err, files) => {
      if (err) {
        return;
      }
      const oneDayInMillis = 7 * 24 * 60 * 60 * 1000;
      const oneDayAgo = new Date().getTime() - oneDayInMillis;
      files.forEach((file) => {
        if (file === "creds.json") return true;
        const filePath = path.join("./hedystia", file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            return true;
          }
          if (stats.birthtimeMs <= oneDayAgo) {
            fs.unlink(filePath, (err) => {
              if (err) return true;
            });
          }
        });
      });
    });

    fs.readdir("./tmp", (err, files) => {
      if (err) return;
      files.forEach((file) => {
        if (file === ".gitignore") return true;
        fs.unlink(`./tmp/${file}`, () => {});
        return true;
      });
    });

    fs.watch("./tmp", (eventType, filename) => {
      if (eventType === "rename") {
        let deleteTime = 30000;
        if (filename.includes(".mp3")) {
          deleteTime = 120000;
        }
        setTimeout(() => {
          fs.unlink(`./tmp/${filename}`, (err) => {
            if (err) return true;
          });
        }, deleteTime);
      }
    });

    setInterval(() => {
      store?.writeToFile("./hedystia.json");
    }, 10000);

    setInterval(
      () => {
        Object.values(store.messages).forEach((m) => m.clear());
        fs.readdir("./hedystia", (err, files) => {
          if (err) {
            return;
          }
          const oneDayInMillis = 7 * 24 * 60 * 60 * 1000;
          const oneDayAgo = new Date().getTime() - oneDayInMillis;
          files.forEach((file) => {
            if (file === "creds.json") return true;
            const filePath = path.join("./hedystia", file);
            fs.stat(filePath, (err, stats) => {
              if (err) {
                return true;
              }
              if (stats.birthtimeMs <= oneDayAgo) {
                fs.unlink(filePath, (err) => {
                  if (err) return true;
                });
              }
            });
          });
        });
      },
      4 * 60 * 60 * 1000,
    );

    fs.readdir("./src/commands", (err, commandFolders) => {
      if (err) return;
      commandFolders.forEach((folder) => {
        fs.readdir(`./src/commands/${folder}`, (err, commandFiles) => {
          if (err) return;
          commandFiles
            .filter((file) => file.endsWith(".js"))
            .forEach((file) => {
              const command = require(`./src/commands/${folder}/${file}`);
              if (command.name) {
                commands.set(command.name, command);
                commandsFolder.set(command.name, { folder, name: command.name });
              }
            });
        });
      });
    });

    const { state, saveCreds } = await useMultiFileAuthState("hedystia");
    const hedystia = hedystiaConnect({
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      browser: ["Hedystia MD", "Safari", "17.4"],
      auth: state,
    });

    hedystia.langs = {
      en: require(`./src/lang/en/bot.json`),
      es: require(`./src/lang/es/bot.json`),
    };

    hedystia.commands = commands;
    hedystia.commandsFolder = commandsFolder;

    store.bind(hedystia.ev);

    hedystia.ws.on("CB:call", async (json) => {
      const callerId = json.content[0].attrs["call-creator"];
      if (json.content[0].tag === "offer") {
        hedystia.sendMessage(callerId, {
          text: "_*A.I Auto Block System*_\nIt seems that you tried to call me, unfortunately you will be blocked automatically.",
        });
        await sleep(8000);
        await hedystia.updateBlockStatus(callerId, "block");
      }
    });

    hedystia.ev.on("messages.upsert", async (chatUpdate) => {
      try {
        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message =
          Object.keys(mek.message)[0] === "ephemeralMessage"
            ? mek.message.ephemeralMessage.message
            : mek.message;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!hedystia.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
        if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        const m = smsg(hedystia, mek, store);
        hedystia.readMessages([mek.key]);
        require("./hedystia")(hedystia, m);
      } catch {}
    });

    hedystia.ev.on("group-participants.update", async () => {
      return true;
      //   const metadata = await hedystia.groupMetadata(anu.id)
      //   try {
      //     const welkompic = { url: "" } // Image Url
      //     const participants = anu.participants
      //     const btn = [
      //       {
      //         urlButton: {
      //           displayText: "",
      //           url: ``,
      //         },
      //       },
      //     ]
      //     for (const num of participants) {
      //       if (anu.action == "add") {
      //         const txt = `Opa, bienvenido al grupo ${metadata.subject}. Lee las reglas y siéntete libre de interactuar en el grupo.`
      //         hedystia.sendWelkom(anu.id, txt, hedystia.user.name, welkompic, btn)
      //       }
      //     }
      //   } catch (err) {}
    });

    hedystia.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
      } else return jid;
    };
    hedystia.ev.on("contacts.update", (update) => {
      for (const contact of update) {
        const id = hedystia.decodeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
      }
    });

    hedystia.getName = (jid, withoutContact = false) => {
      const id = hedystia.decodeJid(jid);
      withoutContact = hedystia.withoutContact || withoutContact;
      let v;
      if (id.endsWith("@g.us")) {
        return new Promise((resolve) => {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) v = hedystia.groupMetadata(id) || {};
          resolve(
            v.name ||
              v.subject ||
              PhoneNumber(`+${id.replace("@s.whatsapp.net", "")}`).getNumber("international"),
          );
        });
      } else {
        v =
          id === "0@s.whatsapp.net"
            ? {
                id,
                name: "WhatsApp",
              }
            : id === hedystia.decodeJid(hedystia.user.id)
              ? hedystia.user
              : store.contacts[id] || {};
      }
      return (
        (withoutContact ? "" : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber(`+${jid.replace("@s.whatsapp.net", "")}`).getNumber("international")
      );
    };

    hedystia.sendContact = async (jid, kon, quoted = "", opts = {}) => {
      const list = [];
      for (const i of kon) {
        list.push({
          displayName: await hedystia.getName(`${i}@s.whatsapp.net`),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await hedystia.getName(`${i}@s.whatsapp.net`)}\nFN:${await hedystia.getName(
            `${i}@s.whatsapp.net`,
          )}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:contact@hedystia.com\nitem2.X-ABLabel:Email\nEND:VCARD`,
        });
      }
      hedystia.sendMessage(
        jid,
        { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts },
        { quoted },
      );
    };

    hedystia.setStatus = (status) => {
      hedystia.query({
        tag: "iq",
        attrs: {
          to: "@s.whatsapp.net",
          type: "set",
          xmlns: "status",
        },
        content: [
          {
            tag: "status",
            attrs: {},
            content: Buffer.from(status, "utf-8"),
          },
        ],
      });
      return status;
    };

    hedystia.public = true;

    hedystia.serializeM = (m) => smsg(hedystia, m, store);

    hedystia.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (lastDisconnect?.error?.output.statusCode !== 401) {
          startHedystia();
        } else {
          console.log("Please scan the qr code again.");
          fs.rmSync("hedystia", { recursive: true });
          fs.rmSync("hedystia.json");
          startHedystia();
        }
      }
      console.clear();
      console.log(`
      ▄▄   ▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄ ▄▄▄▄▄▄
      █  █ █  █       █      ██  █ █  █       █       █   █      █
      █  █▄█  █    ▄▄▄█  ▄    █  █▄█  █  ▄▄▄▄▄█▄     ▄█   █  ▄   █
      █       █   █▄▄▄█ █ █   █       █ █▄▄▄▄▄  █   █ █   █ █▄█  █
      █   ▄   █    ▄▄▄█ █▄█   █▄     ▄█▄▄▄▄▄  █ █   █ █   █      █
      █  █ █  █   █▄▄▄█       █ █   █  ▄▄▄▄▄█ █ █   █ █   █  ▄   █
      █▄▄█ █▄▄█▄▄▄▄▄▄▄█▄▄▄▄▄▄█  █▄▄▄█ █▄▄▄▄▄▄▄█ █▄▄▄█ █▄▄▄█▄█ █▄▄█
      `);
    });

    hedystia.ev.on("creds.update", saveCreds);
    hedystia.send5ButImg = async (jid, text = "", footer = "", img, but = [], options = {}) => {
      const message = await prepareWAMessageMedia(
        { image: img },
        { upload: hedystia.waUploadToServer },
      );
      const template = generateWAMessageFromContent(
        jid.chat,
        proto.Message.fromObject({
          templateMessage: {
            hydratedTemplate: {
              imageMessage: message.imageMessage,
              hydratedContentText: text,
              hydratedFooterText: footer,
              hydratedButtons: but,
            },
          },
        }),
        options,
      );
      hedystia.relayMessage(jid, template.message, { messageId: template.key.id });
    };

    hedystia.sendWelkom = async (jid, text = "", footer = "", img, but = [], options = {}) => {
      const message = await prepareWAMessageMedia(
        { image: img },
        { upload: hedystia.waUploadToServer },
      );
      const template = generateWAMessageFromContent(
        jid,
        proto.Message.fromObject({
          templateMessage: {
            hydratedTemplate: {
              imageMessage: message.imageMessage,
              hydratedContentText: text,
              hydratedFooterText: footer,
              hydratedButtons: but,
            },
          },
        }),
        options,
      );
      hedystia.relayMessage(jid, template.message, { messageId: template.key.id });
    };
    hedystia.sendButtonText = (jid, buttons = [], text, footer, options = {}) => {
      const template = generateWAMessageFromContent(
        jid,
        proto.Message.fromObject({
          templateMessage: {
            hydratedTemplate: {
              hydratedContentText: text,
              hydratedFooterText: footer,
              hydratedButtons: buttons,
            },
          },
        }),
        options,
      );
      hedystia.relayMessage(jid, template.message, { messageId: template.key.id });
    };
    hedystia.sendText = (jid, text, quoted = "", options) =>
      hedystia.sendMessage(jid, { text, ...options }, { quoted });
    hedystia.sendImage = async (jid, path, caption = "", quoted = "", options) => {
      const buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
            ? await await getBuffer(path)
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);
      return await hedystia.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
    };
    hedystia.sendVideo = async (jid, path, caption = "", quoted = "", gif = false, options) => {
      const buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
            ? await await getBuffer(path)
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);
      return await hedystia.sendMessage(
        jid,
        { video: buffer, caption, gifPlayback: gif, ...options },
        { quoted },
      );
    };
    hedystia.sendAudio = async (jid, path, quoted = "", ptt = false, options) => {
      const buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
            ? await await getBuffer(path)
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);
      return await hedystia.sendMessage(jid, { audio: buffer, ptt, ...options }, { quoted });
    };
    hedystia.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
      hedystia.sendMessage(
        jid,
        {
          text,
          contextInfo: {
            mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => `${v[1]}@s.whatsapp.net`),
          },
          ...options,
        },
        { quoted },
      );
    hedystia.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
      const buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
            ? await await getBuffer(path)
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifImg(buff, options);
      } else {
        buffer = await imageToWebp(buff);
      }

      await hedystia.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
      return buffer;
    };
    hedystia.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
      const buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
          ? Buffer.from(path.split`,`[1], "base64")
          : /^https?:\/\//.test(path)
            ? await await getBuffer(path)
            : fs.existsSync(path)
              ? fs.readFileSync(path)
              : Buffer.alloc(0);
      let buffer;
      if (options && (options.packname || options.author)) {
        buffer = await writeExifVid(buff, options);
      } else {
        buffer = await videoToWebp(buff);
      }

      await hedystia.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
      return buffer;
    };
    hedystia.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      const quoted = message.msg ? message.msg : message;
      const mime = (message.msg || message).mimetype || "";
      const messageType = message.mtype
        ? message.mtype.replace(/Message/gi, "")
        : mime.split("/")[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const type = await FileType.fromBuffer(buffer);
      const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    };
    hedystia.sendFile = async (
      jid,
      path,
      filename = "",
      caption = "",
      quoted,
      ptt = false,
      options = {},
    ) => {
      const type = await hedystia.getFile(path, true);
      let { res, data: file, filename: pathFile } = type;
      if ((res && res.status !== 200) || file.length <= 65536) {
        try {
          const msgError = { json: JSON.parse(file.toString()) };
          throw msgError;
        } catch (e) {
          if (e.json) throw e.json;
        }
      }
      const opt = {};
      if (quoted) opt.quoted = quoted;
      if (!type) options.asDocument = true;
      let mtype = "";
      let mimetype = options.mimetype || type.mime;
      let convert;
      if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) {
        mtype = "sticker";
      } else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) {
        mtype = "image";
      } else if (/video/.test(type.mime)) mtype = "video";
      else if (/audio/.test(type.mime)) {
        convert = await toAudio(file, type.ext);
        file = convert.data;
        pathFile = convert.filename;
        mtype = "audio";
        mimetype = options.mimetype || "audio/ogg; codecs=opus";
      } else mtype = "document";
      if (options.asDocument) mtype = "document";
      const message = {
        ...options,
        caption,
        ptt,
        [mtype]: { url: pathFile },
        mimetype,
        fileName: filename || pathFile.split("/").pop(),
      };
      let m;
      try {
        m = await hedystia.sendMessage(jid, message, { ...opt, ...options });
      } catch {
        m = null;
      } finally {
        if (!m) {
          m = await hedystia.sendMessage(
            jid,
            { ...message, [mtype]: file },
            { ...opt, ...options },
          );
        }
        file = null;
        // eslint-disable-next-line no-unsafe-finally
        return m;
      }
    };

    hedystia.downloadMediaMessage = async (message) => {
      const mime = (message.msg || message).mimetype || "";
      const messageType = message.mtype
        ? message.mtype.replace(/Message/gi, "")
        : mime.split("/")[0];
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      return buffer;
    };
    hedystia.sendMedia = async (
      jid,
      path,
      fileName = "",
      caption = "",
      quoted = "",
      options = {},
    ) => {
      const types = await hedystia.getFile(path, true);
      const { mime, res, data, filename } = types;
      if (res && res.status !== 200) {
        try {
          const msgError = { json: JSON.parse(data.toString()) };
          throw msgError;
        } catch (e) {
          if (e.json) throw e.json;
        }
      }
      let type = "";
      let mimetype = mime;
      let pathFile = filename;
      if (options.asDocument) type = "document";
      if (options.asSticker || /webp/.test(mime)) {
        const { writeExif } = require("./src/lib/exif");
        const media = { mimetype: mime, data };
        pathFile = await writeExif(media, {
          packname: options.packname ? options.packname : globalThis.packname,
          author: options.author ? options.author : globalThis.author,
          categories: options.categories ? options.categories : [],
        });
        await fs.promises.unlink(filename);
        type = "sticker";
        mimetype = "image/webp";
      } else if (/image/.test(mime)) type = "image";
      else if (/video/.test(mime)) type = "video";
      else if (/audio/.test(mime)) type = "audio";
      else type = "document";
      await hedystia.sendMessage(
        jid,
        { [type]: { url: pathFile }, caption, mimetype, fileName, ...options },
        { quoted, ...options },
      );
      return fs.promises.unlink(pathFile);
    };
    hedystia.copyNForward = async (jid, message, forceForward = false, options = {}) => {
      let vtype;
      if (options.readViewOnce) {
        message.message =
          message.message &&
          message.message.ephemeralMessage &&
          message.message.ephemeralMessage.message
            ? message.message.ephemeralMessage.message
            : message.message || undefined;
        vtype = Object.keys(message.message.viewOnceMessage.message)[0];
        delete (message.message && message.message.ignore
          ? message.message.ignore
          : message.message || undefined);
        delete message.message.viewOnceMessage.message[vtype].viewOnce;
        message.message = {
          ...message.message.viewOnceMessage.message,
        };
      }

      const mtype = Object.keys(message.message)[0];
      const content = generateForwardMessageContent(message, forceForward);
      const ctype = Object.keys(content)[0];
      let context = {};
      if (mtype !== "conversation") context = message.message[mtype].contextInfo;
      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo,
      };
      const waMessage = generateWAMessageFromContent(
        jid,
        content,
        options
          ? {
              ...content[ctype],
              ...options,
              ...(options.contextInfo
                ? {
                    contextInfo: {
                      ...content[ctype].contextInfo,
                      ...options.contextInfo,
                    },
                  }
                : {}),
            }
          : {},
      );
      await hedystia.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
      return waMessage;
    };

    hedystia.cMod = (jid, copy, text = "", sender = hedystia.user.id, options = {}) => {
      let mtype = Object.keys(copy.message)[0];
      const isEphemeral = mtype === "ephemeralMessage";
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      }
      const msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
      const content = msg[mtype];
      if (typeof content === "string") msg[mtype] = text || content;
      else if (content.caption) content.caption = text || content.caption;
      else if (content.text) content.text = text || content.text;
      if (typeof content !== "string") {
        msg[mtype] = {
          ...content,
          ...options,
        };
      }
      if (copy.key.participant) {
        sender = copy.key.participant = sender || copy.key.participant;
      } else if (copy.key.participant) {
        sender = copy.key.participant = sender || copy.key.participant;
      }
      if (copy.key.remoteJid.includes("@s.whatsapp.net")) {
        sender = sender || copy.key.remoteJid;
      } else if (copy.key.remoteJid.includes("@broadcast")) {
        sender = sender || copy.key.remoteJid;
      }
      copy.key.remoteJid = jid;
      copy.key.fromMe = sender === hedystia.user.id;

      return proto.WebMessageInfo.fromObject(copy);
    };

    hedystia.getFile = async (PATH, save) => {
      let filename;
      let res;
      const data = Buffer.isBuffer(PATH)
        ? PATH
        : /^data:.*?\/.*?;base64,/i.test(PATH)
          ? Buffer.from(PATH.split`,`[1], "base64")
          : /^https?:\/\//.test(PATH)
            ? await (res = await getBuffer(PATH))
            : fs.existsSync(PATH)
              ? ((filename = PATH), fs.readFileSync(PATH))
              : typeof PATH === "string"
                ? PATH
                : Buffer.alloc(0);
      const type = (await FileType.fromBuffer(data)) || {
        mime: "application/octet-stream",
        ext: ".bin",
      };
      filename = path.join(__filename, `./tmp/${new Date() * 1}.${type.ext}`);
      if (data && save) {
        filename = path.join(__dirname, `./tmp/${new Date() * 1}.${type.ext}`);
        await fs.promises.writeFile(filename, data);
      }
      return {
        res,
        filename,
        ...type,
        data,
        deleteFile() {
          return filename && fs.promises.unlink(filename);
        },
      };
    };

    return hedystia;
  }

  startHedystia();

  process.on("uncaughtException", () => {});
  process.on("unhandledRejection", () => {});
} catch {}
