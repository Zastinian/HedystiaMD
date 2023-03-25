function loadCommands(bot) {
  const fs = require("fs");
  const commandFolders = fs.readdirSync("./src/commands");
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`../src/commands/${folder}/${file}`);
      if (command.name) {
        bot.commands.set(command.name, command);
      } else {
        continue;
      }
    }
  }
}
module.exports = loadCommands;
