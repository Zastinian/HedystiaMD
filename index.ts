import qrcode from "qrcode-terminal";
import AssClient from "./src/assets/Client";
import config from "./config";
import loadCommands from "./src/handler/loadCommands";
import fs from "fs";
import {Message} from "whatsapp-web.js";
const commands = new Map();

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const client = new AssClient();

client.commands = commands;

loadCommands(client);

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
} catch (err) {}

client.on("qr", (qr: string) => {
  qrcode.generate(qr, {small: true});
});

client.on("ready", () => {
  console.clear();
  console.log(
    "\x1b[97m%s\x1b[0m",
    `
  ▄▄   ▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄  ▄▄   ▄▄ ▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄ ▄▄▄▄▄▄ 
  █  █ █  █       █      ██  █ █  █       █       █   █      █
  █  █▄█  █    ▄▄▄█  ▄    █  █▄█  █  ▄▄▄▄▄█▄     ▄█   █  ▄   █
  █       █   █▄▄▄█ █ █   █       █ █▄▄▄▄▄  █   █ █   █ █▄█  █
  █   ▄   █    ▄▄▄█ █▄█   █▄     ▄█▄▄▄▄▄  █ █   █ █   █      █
  █  █ █  █   █▄▄▄█       █ █   █  ▄▄▄▄▄█ █ █   █ █   █  ▄   █
  █▄▄█ █▄▄█▄▄▄▄▄▄▄█▄▄▄▄▄▄█  █▄▄▄█ █▄▄▄▄▄▄▄█ █▄▄▄█ █▄▄▄█▄█ █▄▄█
  `
  );
  console.log(`\x1b[36mPlease use the command \x1b[33m${config.prefix}help \x1b[36mto see the list of available commands.\x1b[0m`);
  console.log(`\x1b[36mPor favor, utiliza el comando \x1b[33m${config.prefix}help \x1b[36mpara ver la lista de comandos disponibles.\x1b[0m`);
});

client.on("message_create", async (message: Message) => {
  const PREFIX = config.prefix;
  const LANG = config.lang;
  const lg = await import(`./src/lang/${LANG}/bot.json`);
  const LANGUAGE = JSON.parse(JSON.stringify(lg?.default).replaceAll("{0}", PREFIX));
  const prefixRegex = new RegExp(`^(${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.body)) return;
  const [, matchedPrefix] = message.body.match(prefixRegex) as any;
  const p = matchedPrefix.length;
  const args = message.body.slice(p).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  if (commandName) {
    const command = await client.commands.get(commandName);
    if (!command) return;
    command.run(client, message, LANGUAGE, args, p);
  }
});

client.initialize();
