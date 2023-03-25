const qrcode = require("qrcode-terminal");
const AssClient = require("./assets/Client");
const {globalCommandsCooldown} = require("./config");
const config = require("./config");
const loadCommands = require("./handler/loadCommands.js");
const commands = new Map();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const client = new AssClient();

client.commands = commands;

loadCommands(client);

client.on("qr", (qr) => {
  qrcode.generate(qr, {small: true});
});

client.on("ready", () => {
  console.clear();
  console.log(`
  ███████╗███████╗███╗   ███╗██╗██╗     ███████╗
  ██╔════╝██╔════╝████╗ ████║██║██║     ██╔════╝
  █████╗  ███████╗██╔████╔██║██║██║     █████╗  
  ██╔══╝  ╚════██║██║╚██╔╝██║██║██║     ██╔══╝  
  ███████╗███████║██║ ╚═╝ ██║██║███████╗███████╗
  ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝╚══════╝╚══════╝
  `);
});

client.on("message_create", async (message) => {
  let global = false;
  const PREFIX = config.prefix;
  const LANG = config.lang;
  const LANGUAGE = JSON.parse(JSON.stringify(require(`./lang/${LANG}/bot.json`)).replaceAll("{0}", PREFIX));
  const prefixRegex = new RegExp(`^(${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.body)) return;
  const [, matchedPrefix] = message.body.match(prefixRegex);
  const p = matchedPrefix.length;
  const args = message.body.slice(p).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = await client.commands.get(commandName);
  if (!command) return;
  if (global == true) {
    return;
  }
  if (globalCommandsCooldown == true) {
    global = true;
  }
  command.run(client, message, LANGUAGE, args, p);
  setTimeout(() => {
    global = false;
  }, 2000);
});

client.initialize();
