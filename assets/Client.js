const {Client, LocalAuth} = require("whatsapp-web.js");

class AssClient extends Client {
  constructor() {
    super({
      authStrategy: new LocalAuth(),
      puppeteer: {
        args: [
          "--disable-voice-input",
          "--no-default-browser-check",
          "--disable-translate",
          "--disable-sync",
          "--disable-site-isolation-trials",
          "--disable-renderer-backgrounding",
          "--disable-infobars",
          "--disable-remote-fonts",
          "--disable-logging",
          "--disable-hang-monitor",
          "--disable-default-apps",
          "--disable-breakpad",
          "--no-sandbox",
        ],
        defaultViewport: {
          width: 100,
          height: 100,
        },
        headless: true,
      },
      maxConcurrency: 1,
      maxBrowserMemory: 150 * 1024 * 1024,
      disableMediaDownload: true,
      maxCachedMessages: 0,
    });
  }
}

module.exports = AssClient;
