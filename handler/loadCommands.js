function loadCommands(bot) {
  const fs = require("fs");
  const commandFolders = fs.readdirSync("./commands");
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      if (command.name) {
        bot.commands.set(command.name, command);
        console.log(`Normal: ${file} ✔️`);
      } else {
        console.log(`Normal: ${file}
            ❌ => Missing a help.name or help.name is not in string`);
        continue;
      }
    }
  }
}
module.exports = loadCommands;
