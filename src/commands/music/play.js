const path = require("node:path");
const yts = require("yt-search");
const DownloadYTAudio = require("../../util/downloadMusic");

module.exports = {
	name: "play",
	run: async (bot, lang, message, global, _args, text) => {
		if (!text)
			return bot.sendMessage(
				message.chat,
				{
					text: `${lang.music.play.no_song}`,
				},
				{ quoted: message },
			);
		const downloader = new DownloadYTAudio({
			outputPath: "./tmp",
			ffmpegPath: global.ffmpegPath,
			fileNameGenerator: (videoTitle) => {
				return videoTitle;
			},
			maxParallelDownload: 10,
		});
		try {
			const r = await yts(text);
			const videos = r.videos.slice(0, 1);
			videos.forEach(async (v) => {
				bot.sendMessage(message.chat, { text: lang.music.play.download }, { quoted: message });
				const name = `0x${v.videoId}${Date.now()}x0.mp3`;
				await downloader.download(v.videoId, name);
				return bot.sendMessage(message.chat, {
					audio: { url: `${path.join(__dirname, "../../../tmp")}/${name}` },
					mimetype: "audio/mpeg",
					fileName: `${name}`,
				});
			});
		} catch {
			return bot.sendMessage(message.chat, { text: lang.music.play.error }, { quoted: message });
		}
	},
};
