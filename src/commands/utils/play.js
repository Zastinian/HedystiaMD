const getYouTubeId = (url) => {
  let match = null;
  const regexWatch =
    /(?:https?:\/\/(?:www\.)?youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|(?:.*?[?&]v=))([a-zA-Z0-9_-]{11}))/;
  const regexShorts = /(?:https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11}))/;
  const regexDirectShorts = /(?:https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11}))/;
  match = url.match(regexWatch);
  if (match) return match[1];
  match = url.match(regexShorts);
  if (match) return match[1];
  match = url.match(regexDirectShorts);
  if (match) return match[1];
  return null;
};

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
    bot.sendMessage(message.chat, { text: lang.music.play.download }, { quoted: message });
    let track;
    const id = getYouTubeId(text);
    if (id) {
      const song = await fetch(`https://scrapers.hedystia.com/search/youtube/video?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-First-Request-URL": "https://github.com/Zastinian/HedystiaMD",
          "X-GitHub-Second-Request-URL": "https://github.com/Hidekijs",
        },
      })
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => null);
      if (!song) return bot.sendMessage(message.chat, { text: lang.music.play.not_found });
      track = await fetch(`https://scrapers.hedystia.com/downloads/yt-music?url=${song.url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-First-Request-URL": "https://github.com/Zastinian/HedystiaMD",
          "X-GitHub-Second-Request-URL": "https://github.com/Hidekijs",
        },
      })
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => null);
    } else {
      const songs = await fetch(`https://scrapers.hedystia.com/search/youtube/name?text=${text}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-First-Request-URL": "https://github.com/Zastinian/HedystiaMD",
          "X-GitHub-Second-Request-URL": "https://github.com/Hidekijs",
        },
      })
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => null);
      if (!songs[0]) return bot.sendMessage(message.chat, { text: lang.music.play.not_found });
      track = await fetch(`https://scrapers.hedystia.com/downloads/yt-music?url=${songs[0].url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-GitHub-First-Request-URL": "https://github.com/Zastinian/HedystiaMD",
          "X-GitHub-Second-Request-URL": "https://github.com/Hidekijs",
        },
      })
        .then((res) => res.json())
        .then((data) => data)
        .catch(() => null);
    }
    if (!track) return bot.sendMessage(message.chat, { text: lang.music.play.not_found });
    if (!track.lowFileLink)
      return bot.sendMessage(message.chat, { text: lang.music.play.not_found });
    try {
      return await bot.replyAudio(track.lowFileLink, message, { replyAudio: false });
    } catch {
      return bot.sendMessage(message.chat, { text: lang.music.play.error }, { quoted: message });
    }
  },
};
