const { sticker } = require("../../lib/sticker");

module.exports = {
  name: "invert",
  run: async ({ bot, message, global }) => {
    const user = message.quoted
      ? message.quoted.sender
      : message.mentionedJid && message.mentionedJid[0]
        ? message.mentionedJid[0]
        : message.fromMe
          ? bot.user.jid
          : message.sender;
    const response = await fetch(
      `https://strangeapi.hostz.me/api/filters/invert?image=${encodeURIComponent(await bot.profilePictureUrl(user).catch(() => "https://w7.pngwing.com/pngs/717/24/png-transparent-computer-icons-user-profile-user-account-avatar-heroes-silhouette-black-thumbnail.png"))}}`,
      {
        headers: {
          Authorization: `Bearer ${global.imageToken}`,
        },
      },
    );
    const buffer = await response.arrayBuffer();
    const buf = Buffer.from(buffer);
    const stiker = await sticker(buf, null);
    bot.sendFile(message.chat, stiker, null, { asSticker: true });
  },
};
