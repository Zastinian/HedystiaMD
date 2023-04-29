const qrcode = require("qrcode-terminal");
const AssClient = require("./src/assets/Client");
const config = require("./config");
const loadCommands = require("./src/handler/loadCommands.js");
const loadMenus = require("./src/handler/loadMenus.js");
const fs = require("fs");
const commands = new Map();
const menus = new Map();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const client = new AssClient();

client.commands = commands;
client.menus = menus;

loadCommands(client);
loadMenus(client);

try {
  fs.readdir("./tmp", (err, files) => {
    if (err) return;
    files.map((file) => {
      if (file == ".gitignore") return;
      fs.unlink(`./tmp/${file}`, (err) => {});
    });
  });

  fs.watch("./tmp", (eventType, filename) => {
    if (eventType === "rename") {
      setTimeout(() => {
        fs.unlink(`./tmp/${filename}`, (err) => {
          if (err) return;
        });
      }, 60000);
    }
  });
} catch (err) {
  return;
}

client.on("qr", (qr) => {
  qrcode.generate(qr, {small: true});
});

client.on("ready", () => {
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

client.on("message_create", async (message) => {
  if (message.type == "buttons_response") {
    const PREFIX = config.prefix;
    const LANG = config.lang;
    const LANGUAGE = JSON.parse(JSON.stringify(require(`./src/lang/${LANG}/bot.json`)).replaceAll("{0}", PREFIX));
    const menu = await client.menus.get(message.selectedButtonId);
    if (!menu) return;
    menu.run(client, message, LANGUAGE);
  } else {
    const PREFIX = config.prefix;
    const LANG = config.lang;
    const LANGUAGE = JSON.parse(JSON.stringify(require(`./src/lang/${LANG}/bot.json`)).replaceAll("{0}", PREFIX));
    const prefixRegex = new RegExp(`^(${escapeRegex(PREFIX)})\\s*`);
    if (!prefixRegex.test(message.body)) return;
    const [, matchedPrefix] = message.body.match(prefixRegex);
    const p = matchedPrefix.length;
    const args = message.body.slice(p).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = await client.commands.get(commandName);
    if (!command) return;
    command.run(client, message, LANGUAGE, args, p);
  }
});

client.initialize();
