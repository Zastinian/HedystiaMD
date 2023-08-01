const prefix: string = "!";
const lang: "en-US" | "es-ES" = "en-US";
/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 */
const ffmpegPath = "/usr/bin/ffmpeg";

export default {
  prefix,
  lang,
  ffmpegPath,
};
