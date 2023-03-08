const {Client, LocalAuth} = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const config = require("./config");
const loadCommands = require("./handler/loadCommands.js");
const commands = new Map();

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--limit-cpu=0.25",
      "--max-old-space-size=150",
    ],
    defaultViewport: {
      width: 800,
      height: 600,
    },
    headless: true,
  },
  disableMediaDownload: true,
});

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
  command.run(client, message, LANGUAGE, args, p);
});

client.initialize();
