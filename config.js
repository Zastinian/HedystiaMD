const fs = require("node:fs")

globalThis.prefix = ["!"]
globalThis.packname = "Hedystia Bot"
globalThis.author = "Hedystia"
globalThis.thumb = fs.readFileSync("./src/assets/smoke.gif")

/**
 * @description To use it on windows you must download ffmpeg and put the following where the bin file is located
 * @example
 * C:\\ffmpeg\\bin\\ffmpeg.exe
 * C:\\ProgramData\\chocolatey\\lib\\ffmpeg\\tools\\ffmpeg\\bin\\ffmpeg.exe
 */
globalThis.ffmpegPath = "/usr/bin/ffmpeg"
