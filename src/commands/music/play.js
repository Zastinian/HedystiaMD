const music = require("../../util/music");

module.exports = {
  name: "play",
  run: async (bot, message, global, args, text) => {
    if (!text) return bot.sendMessage(message.chat, {text: "You must tell me the name or link of the music"}, {quoted: message});
    music(bot, text, message);
  },
};
