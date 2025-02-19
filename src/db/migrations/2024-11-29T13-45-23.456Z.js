const readline = require("readline");

function getPrivateStatus() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const askPrivate = async () => {
      console.log("");
      rl.question(
        "\x1b[93mTell me if you want to disable or enable private chats (true/false)\x1b[94m\n⤳\x1b[0m ",
        (input) => {
          const value = input.toLowerCase().trim();
          if (
            value === "true" ||
            value === "on" ||
            value === "encendido" ||
            value === "enabled" ||
            value === "false" ||
            value === "off" ||
            value === "apagado" ||
            value === "desactivado" ||
            value === "disabled"
          ) {
            let l;
            switch (value) {
              case "true":
                l = true;
                break;
              case "on":
                l = true;
                break;
              case "enabled":
                l = true;
                break;
              case "false":
                l = false;
                break;
              case "off":
                l = false;
                break;
              case "apagado":
                l = false;
                break;
              case "desactivado":
                l = false;
                break;
              case "disabled":
                l = false;
                break;
            }
            resolve(l);
            rl.close();
          } else {
            console.log("");
            console.log("\x1b[91mERROR: \x1b[92mThe private status provided is not correct\x1b[0m");
            setTimeout(() => {
              console.log("");
              askPrivate();
            });
          }
        },
      );
    };
    askPrivate();
  });
}

module.exports = async (config) => {
  config.deleteTableIfExists("private");
  config.createTable("private", ["id", "value"]);
  const p = await getPrivateStatus();
  config.insert("private", { id: "private", value: p });
};
