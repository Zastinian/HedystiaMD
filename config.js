const fs = require("node:fs");

globalThis.prefix = "!";
globalThis.packname = "Hedystia Bot";
globalThis.author = "Hedystia";
globalThis.thumb = fs.readFileSync("./src/assets/smoke.gif");

/**
 * @description Configuration of the anti-links section.
 */
global.antiLinks = {
	enabled: false,
	allowed: ["https://hedystia.com", "https://zastinian.com"],
	admins_allowed: true,
	/**
	 * @method action: delete | kick
	 */
	action: "delete",
};

/**
 * @description You need to generate a token you can use the dashboard or the api discord.
 * @link https://strangeapi.hostz.me/dashboard
 * @link https://discord.gg/f7ADs3Ncu3
 */
global.imageToken = "";

/**
 * @default "en"
 * @param "en", "es"
 * @example
 * globalThis.lang = "es"
 */
globalThis.lang = "en";

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
