import {MessageMedia, Message} from "whatsapp-web.js";
import yts from "yt-search";
import DownloadYTAudio from "../../../music";
import AssClient from "../../assets/Client";
import {Lang} from "../../types/Lang";
import config from "../../../config";

const downloader = new DownloadYTAudio({
  outputPath: "./tmp",
  ffmpegPath: config.ffmpegPath,
  fileNameGenerator: (videoTitle: string) => {
    return videoTitle;
  },
  maxParallelDownload: 10,
});

export default {
  name: "play",
  run: async (bot: AssClient, message: Message, lang: Lang, args: object[]) => {
    if (!args[0]) return await message.reply(lang.play.info2);
    findYtSong(args.slice(0).join(" "), message);
    async function findYtSong(songName: string, message: Message) {
      try {
        const r = await yts(songName);
        const videos = r.videos.slice(0, 1);
        videos.forEach(async (v: {videoId: string}) => {
          message.reply(lang.play.info);
          const name = `0x${v.videoId}${Date.now()}x0.mp3`;
          await downloader.download(v.videoId, name);
          const media = MessageMedia.fromFilePath("./tmp/" + name);
          await message.reply(media);
        });
      } catch (e) {
        message.reply(lang.play.error);
      }
    }
  },
};
