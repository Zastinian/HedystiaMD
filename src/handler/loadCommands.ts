import AssClient from "../assets/Client";
import fs from "fs";

async function loadCommands(bot: AssClient) {
  const commandFolders = fs.readdirSync("./src/commands");
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`);
    for (const file of commandFiles) {
      const data = await import(`../commands/${folder}/${file}`);
      const command = data?.default;
      if (command.name) {
        bot.commands.set(command.name, command);
      } else {
        continue;
      }
    }
  }
}
export default loadCommands;
