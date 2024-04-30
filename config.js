const fs = require("node:fs");

globalThis.prefix = ["!"];
globalThis.packname = "Hedystia Bot";
globalThis.author = "Hedystia";
globalThis.thumb = fs.readFileSync("./src/assets/smoke.gif");

/**
 * @default "en"
 * @param "en", "es"
 * @example
 * globalThis.lang = "es"
 */
globalThis.lang = "en";

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * LINUX
 * /usr/bin/ffmpeg
 *
 * WINDOWS
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 * C:\\ProgramData\\chocolatey\\lib\\ffmpeg\\tools\\ffmpeg\\bin\\ffmpeg.exe
 */
globalThis.ffmpegPath = "/usr/bin/ffmpeg";
