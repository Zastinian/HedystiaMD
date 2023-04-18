require("./config");
const {
  default: hedystiaConnect,
  useMultiFileAuthState,
  DisconnectReason,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
} = require("@adiwajshing/baileys");
const pino = require("pino");
const fs = require("fs");
const {Boom} = require("@hapi/boom");
const FileType = require("file-type");
const PhoneNumber = require("awesome-phonenumber");
const {imageToWebp, videoToWebp, writeExifImg, writeExifVid} = require("./src/lib/exif");
const path = require("path");
const {smsg, getBuffer, sleep} = require("./src/lib/myfunc");

try {
  const store = makeInMemoryStore({logger: pino().child({level: "silent"})});
  store?.readFromFile("./hedystia.json");

  setInterval(() => {
    store?.writeToFile("./hedystia.json");
  }, 10_000);

  fs.readdir("./tmp", (err, files) => {
    if (err) return;
    files.map((file) => {
      if (file == "file") return;
      fs.unlink(`./tmp/${file}`, (err) => {});
    });
  });

  fs.watch("./tmp", (eventType, filename) => {
    if (eventType === "rename") {
      setTimeout(() => {
        fs.unlink(`./tmp/${filename}`, (err) => {
          if (err) return;
        });
      }, 20000);
    }
  });

  async function startHedystia() {
    const {state, saveCreds} = await useMultiFileAuthState("hedystia");
    const hedystia = hedystiaConnect({
      logger: pino({level: "error"}),
      printQRInTerminal: true,
      browser: ["Hedystia MD", "Safari", "1.0.1"],
      auth: state,
      version: [2, 2204, 13],
    });

    store.bind(hedystia.ev);

    hedystia.ws.on("CB:call", async (json) => {
      const callerId = json.content[0].attrs["call-creator"];
      if (json.content[0].tag == "offer") {
        hedystia.sendMessage(callerId, {
          text: `_*A.I Auto Block System*_\nIt seems that you tried to call me, unfortunately you will be blocked automatically.`,
        });
        await sleep(8000);
        await hedystia.updateBlockStatus(callerId, "block");
      }
    });

    hedystia.ev.on("messages.upsert", async (chatUpdate) => {
      try {
        mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = Object.keys(mek.message)[0] === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;
        if (mek.key && mek.key.remoteJid === "status@broadcast") return;
        if (!hedystia.public && !mek.key.fromMe && chatUpdate.type === "notify") return;
        if (mek.key.id.startsWith("BAE5") && mek.key.id.length === 16) return;
        m = smsg(hedystia, mek, store);
        require("./hedystia")(hedystia, m, chatUpdate, store);
      } catch (err) {}
    });

    hedystia.ev.on("group-participants.update", async (anu) => {
      return;
      let metadata = await hedystia.groupMetadata(anu.id);
      try {
        let welkompic = {url: ""}; // Image Url
        let participants = anu.participants;
        let btn = [
          {
            urlButton: {
              displayText: "",
              url: ``,
            },
          },
        ];
        for (let num of participants) {
          if (anu.action == "add") {
            let txt = `Opa, bienvenido al grupo ${metadata.subject}. Lee las reglas y siéntete libre de interactuar en el grupo.`;
            hedystia.sendWelkom(anu.id, txt, hedystia.user.name, welkompic, btn);
          }
        }
      } catch (err) {}
    });

    hedystia.decodeJid = (jid) => {
      if (!jid) return jid;
      if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
      } else return jid;
    };
    hedystia.ev.on("contacts.update", (update) => {
      for (let contact of update) {
        let id = hedystia.decodeJid(contact.id);
        if (store && store.contacts) store.contacts[id] = {id, name: contact.notify};
      }
    });

    hedystia.getName = (jid, withoutContact = false) => {
      id = hedystia.decodeJid(jid);
      withoutContact = hedystia.withoutContact || withoutContact;
      let v;
      if (id.endsWith("@g.us"))
        return new Promise(async (resolve) => {
          v = store.contacts[id] || {};
          if (!(v.name || v.subject)) v = hedystia.groupMetadata(id) || {};
          resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
        });
      else
        v =
          id === "0@s.whatsapp.net"
            ? {
                id,
                name: "WhatsApp",
              }
            : id === hedystia.decodeJid(hedystia.user.id)
            ? hedystia.user
            : store.contacts[id] || {};
      return (
        (withoutContact ? "" : v.name) ||
        v.subject ||
        v.verifiedName ||
        PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international")
      );
    };

    hedystia.sendContact = async (jid, kon, quoted = "", opts = {}) => {
      let list = [];
      for (let i of kon) {
        list.push({
          displayName: await hedystia.getName(i + "@s.whatsapp.net"),
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await hedystia.getName(i + "@s.whatsapp.net")}\nFN:${await hedystia.getName(
            i + "@s.whatsapp.net"
          )}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:contact@hedystia.com\nitem2.X-ABLabel:Email\nitem3.URL:https://www.instagram.com/zastinianyt\nitem3.X-ABLabel:Instagram\nitem4.ADR:;;Indonesia;;;;\nitem4.X-ABLabel:Region\nEND:VCARD`,
        });
      }
      hedystia.sendMessage(jid, {contacts: {displayName: `${list.length} Kontak`, contacts: list}, ...opts}, {quoted});
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
      const {connection, lastDisconnect} = update;
      if (connection === "close") {
        let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
        if (reason === DisconnectReason.badSession) {
          console.log(`Bad Session File, Please Delete Session and Scan Again`);
          hedystia.logout();
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log("Connection closed, reconnecting....");
          startHedystia();
        } else if (reason === DisconnectReason.connectionLost) {
          console.log("Connection Lost from Server, reconnecting...");
          startHedystia();
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First");
          hedystia.logout();
        } else if (reason === DisconnectReason.loggedOut) {
          console.log(`Device Logged Out, Please Scan Again And Run.`);
          hedystia.logout();
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("Restart Required, Restarting...");
          startHedystia();
        } else if (reason === DisconnectReason.timedOut) {
          console.log("Connection TimedOut, Reconnecting...");
          startHedystia();
        } else hedystia.end(`Unknown DisconnectReason: ${reason}|${connection}`);
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
      let message = await prepareWAMessageMedia({image: img}, {upload: hedystia.waUploadToServer});
      var template = generateWAMessageFromContent(
        m.chat,
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
        options
      );
      hedystia.relayMessage(jid, template.message, {messageId: template.key.id});
    };

    hedystia.sendWelkom = async (jid, text = "", footer = "", img, but = [], options = {}) => {
      let message = await prepareWAMessageMedia({image: img}, {upload: hedystia.waUploadToServer});
      var template = generateWAMessageFromContent(
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
        options
      );
      hedystia.relayMessage(jid, template.message, {messageId: template.key.id});
    };
    hedystia.sendButtonText = (jid, buttons = [], text, footer, quoted = "", options = {}) => {
      let buttonMessage = {
        text,
        footer,
        buttons,
        headerType: 2,
        ...options,
      };
      var template = generateWAMessageFromContent(
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
        options
      );
      hedystia.relayMessage(jid, template.message, {messageId: template.key.id});
    };
    hedystia.sendText = (jid, text, quoted = "", options) => hedystia.sendMessage(jid, {text: text, ...options}, {quoted});
    hedystia.sendImage = async (jid, path, caption = "", quoted = "", options) => {
      let buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
        ? await await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
      return await hedystia.sendMessage(jid, {image: buffer, caption: caption, ...options}, {quoted});
    };
    hedystia.sendVideo = async (jid, path, caption = "", quoted = "", gif = false, options) => {
      let buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
        ? await await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
      return await hedystia.sendMessage(jid, {video: buffer, caption: caption, gifPlayback: gif, ...options}, {quoted});
    };
    hedystia.sendAudio = async (jid, path, quoted = "", ptt = false, options) => {
      let buffer = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split`,`[1], "base64")
        : /^https?:\/\//.test(path)
        ? await await getBuffer(path)
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
      return await hedystia.sendMessage(jid, {audio: buffer, ptt: ptt, ...options}, {quoted});
    };
    hedystia.sendTextWithMentions = async (jid, text, quoted, options = {}) =>
      hedystia.sendMessage(
        jid,
        {text: text, contextInfo: {mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map((v) => v[1] + "@s.whatsapp.net")}, ...options},
        {quoted}
      );
    hedystia.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
      let buff = Buffer.isBuffer(path)
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

      await hedystia.sendMessage(jid, {sticker: {url: buffer}, ...options}, {quoted});
      return buffer;
    };
    hedystia.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
      let buff = Buffer.isBuffer(path)
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

      await hedystia.sendMessage(jid, {sticker: {url: buffer}, ...options}, {quoted});
      return buffer;
    };
    hedystia.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || "";
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      let type = await FileType.fromBuffer(buffer);
      trueFileName = attachExtension ? filename + "." + type.ext : filename;
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    };
    hedystia.sendFile = async (jid, path, filename = "", caption = "", quoted, ptt = false, options = {}) => {
      let type = await hedystia.getFile(path, true);
      let {res, data: file, filename: pathFile} = type;
      if ((res && res.status !== 200) || file.length <= 65536) {
        try {
          throw {json: JSON.parse(file.toString())};
        } catch (e) {
          if (e.json) throw e.json;
        }
      }
      let opt = {};
      if (quoted) opt.quoted = quoted;
      if (!type) options.asDocument = true;
      let mtype = "",
        mimetype = options.mimetype || type.mime,
        convert;
      if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = "sticker";
      else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = "image";
      else if (/video/.test(type.mime)) mtype = "video";
      else if (/audio/.test(type.mime))
        (convert = await toAudio(file, type.ext)),
          (file = convert.data),
          (pathFile = convert.filename),
          (mtype = "audio"),
          (mimetype = options.mimetype || "audio/ogg; codecs=opus");
      else mtype = "document";
      if (options.asDocument) mtype = "document";
      let message = {
        ...options,
        caption,
        ptt,
        [mtype]: {url: pathFile},
        mimetype,
        fileName: filename || pathFile.split("/").pop(),
      };
      let m;
      try {
        m = await hedystia.sendMessage(jid, message, {...opt, ...options});
      } catch (e) {
        m = null;
      } finally {
        if (!m) m = await hedystia.sendMessage(jid, {...message, [mtype]: file}, {...opt, ...options});
        file = null;
        return m;
      }
    };

    hedystia.downloadMediaMessage = async (message) => {
      let mime = (message.msg || message).mimetype || "";
      let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
      const stream = await downloadContentFromMessage(message, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      return buffer;
    };
    hedystia.sendMedia = async (jid, path, fileName = "", caption = "", quoted = "", options = {}) => {
      let types = await hedystia.getFile(path, true);
      let {mime, ext, res, data, filename} = types;
      if ((res && res.status !== 200) || file.length <= 65536) {
        try {
          throw {json: JSON.parse(file.toString())};
        } catch (e) {
          if (e.json) throw e.json;
        }
      }
      let type = "",
        mimetype = mime,
        pathFile = filename;
      if (options.asDocument) type = "document";
      if (options.asSticker || /webp/.test(mime)) {
        let {writeExif} = require("./src/lib/exif");
        let media = {mimetype: mime, data};
        pathFile = await writeExif(media, {
          packname: options.packname ? options.packname : global.packname,
          author: options.author ? options.author : global.author,
          categories: options.categories ? options.categories : [],
        });
        await fs.promises.unlink(filename);
        type = "sticker";
        mimetype = "image/webp";
      } else if (/image/.test(mime)) type = "image";
      else if (/video/.test(mime)) type = "video";
      else if (/audio/.test(mime)) type = "audio";
      else type = "document";
      await hedystia.sendMessage(jid, {[type]: {url: pathFile}, caption, mimetype, fileName, ...options}, {quoted, ...options});
      return fs.promises.unlink(pathFile);
    };
    hedystia.copyNForward = async (jid, message, forceForward = false, options = {}) => {
      let vtype;
      if (options.readViewOnce) {
        message.message =
          message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message
            ? message.message.ephemeralMessage.message
            : message.message || undefined;
        vtype = Object.keys(message.message.viewOnceMessage.message)[0];
        delete (message.message && message.message.ignore ? message.message.ignore : message.message || undefined);
        delete message.message.viewOnceMessage.message[vtype].viewOnce;
        message.message = {
          ...message.message.viewOnceMessage.message,
        };
      }

      let mtype = Object.keys(message.message)[0];
      let content = await generateForwardMessageContent(message, forceForward);
      let ctype = Object.keys(content)[0];
      let context = {};
      if (mtype != "conversation") context = message.message[mtype].contextInfo;
      content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo,
      };
      const waMessage = await generateWAMessageFromContent(
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
          : {}
      );
      await hedystia.relayMessage(jid, waMessage.message, {messageId: waMessage.key.id});
      return waMessage;
    };

    hedystia.cMod = (jid, copy, text = "", sender = hedystia.user.id, options = {}) => {
      let mtype = Object.keys(copy.message)[0];
      let isEphemeral = mtype === "ephemeralMessage";
      if (isEphemeral) {
        mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
      }
      let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message;
      let content = msg[mtype];
      if (typeof content === "string") msg[mtype] = text || content;
      else if (content.caption) content.caption = text || content.caption;
      else if (content.text) content.text = text || content.text;
      if (typeof content !== "string")
        msg[mtype] = {
          ...content,
          ...options,
        };
      if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
      else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
      if (copy.key.remoteJid.includes("@s.whatsapp.net")) sender = sender || copy.key.remoteJid;
      else if (copy.key.remoteJid.includes("@broadcast")) sender = sender || copy.key.remoteJid;
      copy.key.remoteJid = jid;
      copy.key.fromMe = sender === hedystia.user.id;

      return proto.WebMessageInfo.fromObject(copy);
    };

    hedystia.getFile = async (PATH, save) => {
      let res;
      let data = Buffer.isBuffer(PATH)
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
      let type = (await FileType.fromBuffer(data)) || {
        mime: "application/octet-stream",
        ext: ".bin",
      };
      filename = path.join(__filename, "./tmp/" + new Date() * 1 + "." + type.ext);
      if (data && save) (filename = path.join(__dirname, "./tmp/" + new Date() * 1 + "." + type.ext)), await fs.promises.writeFile(filename, data);
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

  process.on("uncaughtException", (err) => {
    return;
  });
  process.on("unhandledRejection", (reason, promise) => {
    return;
  });
} catch (err) {}
