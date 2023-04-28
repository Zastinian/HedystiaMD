const sendMusic = require("./downloadMusic");

module.exports = function (bot, ms, message) {
  bot.sendMessage(message.chat, {text: "Music is being searched and downloaded"}, {quoted: message});
  const nameSong = encodeURIComponent(ms);
  sendMusic(message, bot, nameSong);
};
