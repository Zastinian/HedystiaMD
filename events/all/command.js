const config = require("../../config");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
module.exports = async (message, bot) => {
  const PREFIX = config.prefix;
  const LANG = config.lang;
  const LANGUAGE = JSON.parse(JSON.stringify(require(`../../lang/${LANG}/bot.json`)).replaceAll("{0}", PREFIX));
  const prefixRegex = new RegExp(`^(${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.body)) return;
  const [, matchedPrefix] = message.body.match(prefixRegex);
  const p = matchedPrefix.length;
  const args = message.body.slice(p).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = await bot.commands.get(commandName);
  if (!command) return;
  command.run(bot, message, LANGUAGE, args, p);
};
