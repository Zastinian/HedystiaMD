const cloud = require("soundcloud.ts").default;

module.exports = {
  name: "play",
  run: async ({ bot, lang, message, text }) => {
    if (!text) {
      return bot.sendMessage(
        message.chat,
        {
          text: `${lang.music.play.no_song}`,
        },
        { quoted: message },
      );
    }
    const client = new cloud();
    const customRegex = /^.+\/.+$/;
    bot.sendMessage(message.chat, { text: lang.music.play.download }, { quoted: message });
    let track;
    if (customRegex.test(text)) {
      track = await client.tracks.getAlt(text);
    } else {
      track = await client.tracks.searchAlt(text);
    }
    if (!track || !track[0])
      return bot.sendMessage(message.chat, { text: lang.music.play.not_found });
    try {
      await client.util.downloadTrack(`${track[0].user.permalink}/${track[0].permalink}`, "./tmp");
      return bot.sendMessage(message.chat, {
        audio: { url: `${path.join(__dirname, "../../../tmp")}/${track[0].title}.mp3` },
        mimetype: "audio/mpeg",
        fileName: `${track[0].title}`,
      });
    } catch {
      return bot.sendMessage(message.chat, { text: lang.music.play.error }, { quoted: message });
    }
  },
};
