const prefix = "!";
const lang = "en-US";

module.exports = {
  prefix,
  lang,
};

global.prefix = prefix;

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 */
global.ffmpegPath = "/usr/bin/ffmpeg";
