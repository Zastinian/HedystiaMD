const prefix = "!";
const lang = "en-US";

module.exports = {
  prefix,
  lang,
  globalMusicCooldown: true, // Do not disable if you have few resources
  globalCommandsCooldown: true, // Do not disable if you have few resources
};

global.prefix = prefix;

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 */
global.ffmpegPath = "C:\\ffmpeg\\bin\\ffmpeg.exe";
