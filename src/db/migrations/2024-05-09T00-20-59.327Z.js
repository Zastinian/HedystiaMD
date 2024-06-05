const readline = require("readline");
const wait = require("../../util/wait");
const printText = require("../../util/printText");

function getPrefix() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const askPrefix = async () => {
      console.log("");
      const pref = "\x1b[93mTell me the prefix you want to use\x1b[0m";
      printText(pref, 0);
      await wait(pref.length * 100 + 1000);
      rl.question("\x1b[93mTell me the prefix you want to use\x1b[94m\n⤳\x1b[0m ", (input) => {
        const prefix = input.trim();
        if (prefix.length > 6) {
          console.log("");
          const err = "\x1b[91mERROR: \x1b[92mThe prefix must have a maximum length of 6\x1b[0m";
          printText(err, 0);
          setTimeout(
            () => {
              console.log("");
              askPrefix();
            },
            err.length * 100 + 1000,
          );
          return;
        }
        resolve(prefix);
        rl.close();
      });
    };
    askPrefix();
  });
}

function getLang() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const askLang = async () => {
      console.log("");
      const pref = "\x1b[93mTell me the language you want to use (English/Español)\x1b[0m";
      printText(pref, 0);
      await wait(pref.length * 100 + 1000);
      rl.question(
        "\x1b[93mTell me the language you want to use (English/Español)\x1b[94m\n⤳\x1b[0m ",
        (input) => {
          const lang = input.toLowerCase().trim();
          if (
            lang === "english" ||
            lang === "en" ||
            lang === "ingles" ||
            lang === "inglés" ||
            lang === "español" ||
            lang === "es" ||
            lang === "spanish"
          ) {
            let l;
            switch (lang) {
              case "español":
                l = "es";
                break;
              case "es":
                l = "es";
                break;
              case "spanish":
                l = "es";
                break;
              default:
                l = "en";
                break;
            }
            resolve(l);
            rl.close();
          } else {
            console.log("");
            const err = "\x1b[91mERROR: \x1b[92mThe language provided is not correct\x1b[0m";
            printText(err, 0);
            setTimeout(
              () => {
                console.log("");
                askLang();
              },
              err.length * 100 + 1000,
            );
          }
        },
      );
    };
    askLang();
  });
}

module.exports = {
  date: "2024-05-09T00:20:59.327Z",
  type: "config",
  run: async (migrations, config) => {
    config.deleteTableIfExists("antiLinks");
    config.deleteTableIfExists("owner");
    config.deleteTableIfExists("prefix");
    config.deleteTableIfExists("lang");
    config.createTable("antiLinks", ["id", "enabled", "allowed", "admins_allowed", "action"]);
    config.createTable("owner", ["id", "value"]);
    config.createTable("prefix", ["id", "value"]);
    config.createTable("lang", ["id", "value"]);
    config.insert("antiLinks", {
      id: "antiLinks",
      enabled: false,
      allowed: ["https://hedystia.com", "https://zastinian.com"],
      admins_allowed: true,
      action: "delete",
    });
    config.insert("owner", { id: "owner", value: false });
    const p = await getPrefix();
    config.insert("prefix", { id: "prefix", value: p });
    const l = await getLang();
    config.insert("lang", { id: "lang", value: l });
    migrations.insert("version", { date: "2024-05-09T00:20:59.327Z" });
  },
};
