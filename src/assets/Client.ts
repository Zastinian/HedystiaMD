import {Client, LocalAuth} from "whatsapp-web.js";
import {Command} from "../types/Command";

class AssClient extends Client {
  commands!: Map<string, Command>;
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
          "--headless=new",
          "--no-sandbox",
        ],
        defaultViewport: {
          width: 100,
          height: 100,
        },
        headless: true,
        ignoreHTTPSErrors: true,
      },
    });
  }
}

export default AssClient;
