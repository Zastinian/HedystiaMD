const {create} = require("@open-wa/wa-automate");
const loadCommands = require("./handler/loadCommands.js");
const loadEvents = require("./handler/loadEvents.js");

const commands = new Map();

const startBot = (bot) => {
  console.clear();
  bot.commands = commands;
  loadCommands(bot);
  loadEvents(bot);

  bot.onStateChanged(async (state) => {
    if (state === "CONFLICT" || state === "UNLAUNCHED") bot.forceRefocus();
    console.log("[Client State]", state);
  });
};

create({
  multiDevice: true,
  authTimeout: 60,
  blockCrashLogs: false,
  disableSpins: true,
  headless: true,
  hostNotificationLang: "PT_BR",
  logConsole: false,
  popup: false,
  qrTimeout: 0,
  sessionId: "ZHYCORP",
  //executablePath: "C:\\Users\\Zastinian\\AppData\\Local\\Vivaldi\\Application\\vivaldi.exe",
  chromiumArgs: ["--disable-gpu", "--disable-dev-shm-usage", "--disable-setuid-sandbox", "--no-sandbox", "--disable-dev-shm-usage"],
  useChrome: false,
}).then(startBot);

process.on("uncaughtException", (err) => {
  return;
});
process.on("unhandledRejection", (reason, promise) => {
  return;
});
