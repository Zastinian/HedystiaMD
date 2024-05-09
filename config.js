globalThis.packname = "Hedystia Bot";
globalThis.author = "Hedystia";
globalThis.db = require("./db");

/**
 * @description You need to generate a token you can use the dashboard or the api discord.
 * @link https://strangeapi.hostz.me/dashboard
 * @link https://discord.gg/f7ADs3Ncu3
 */
globalThis.imageToken = "";

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located.
 * @example
 * LINUX
 * /usr/bin/ffmpeg
 *
 * WINDOWS
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 * C:\\ProgramData\\chocolatey\\lib\\ffmpeg\\tools\\ffmpeg\\bin\\ffmpeg.exe
 */
globalThis.ffmpegPath = "/usr/bin/ffmpeg";
