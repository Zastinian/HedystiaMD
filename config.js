const fs = require("fs");

global.prefix = ["!"];
global.packname = "Hedystia Bot";
global.author = "Hedystia";
global.thumb = fs.readFileSync("./src/assets/smoke.gif");

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 */
global.ffmpegPath = "/usr/bin/ffmpeg";
