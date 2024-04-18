const path = require("node:path")
const yts = require("yt-search")
const DownloadYTAudio = require("../../util/downloadMusic")

module.exports = {
	name: "play",
	run: async (bot, message, global, _args, text) => {
		if (!text)
			return bot.sendMessage(
				message.chat,
				{
					text: `*You must put the song*\n\n*Example:*\n{0}play Miley Cyrus - Flowers`.replace(
						"{0}",
						global.prefix[0]
					),
				},
				{ quoted: message }
			)
		const downloader = new DownloadYTAudio({
			outputPath: "./tmp",
			ffmpegPath: global.ffmpegPath,
			fileNameGenerator: (videoTitle) => {
				return videoTitle
			},
			maxParallelDownload: 10,
		})
		try {
			const r = await yts(text)
			const videos = r.videos.slice(0, 1)
			videos.forEach(async (v) => {
				bot.sendMessage(
					message.chat,
					{ text: "I'm looking for and downloading the song!" },
					{ quoted: message }
				)
				const name = `0x${v.videoId}${Date.now()}x0.mp3`
				await downloader.download(v.videoId, name)
				return bot.sendMessage(message.chat, {
					audio: { url: `${path.join(__dirname, "../../../tmp")}/${name}` },
					mimetype: "audio/mpeg",
					fileName: `${name}`,
				})
			})
		} catch (e) {
			return bot.sendMessage(
				message.chat,
				{ text: "There was an error playing the music" },
				{ quoted: message }
			)
		}
	},
}
