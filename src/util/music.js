const wait = require("./wait");

module.exports = function (bot, ms, message) {
  bot.sendMessage(message.chat, {text: "Music is sent in 30 seconds while downloading and processing"}, {quoted: message});
  function waitUntilFileExists(fileUrl, interval = 2000, retries = 10) {
    return new Promise((resolve, reject) => {
      const checkFile = () => {
        fetch(fileUrl, {method: "HEAD"})
          .then((response) => {
            if (response.ok) {
              resolve();
            }
          })
          .catch((error) => {});
      };
      checkFile();
    });
  }
  let name;
  const nameSong = encodeURIComponent(ms);
  fetch("https://cdn.hedystia.com/create-au?songName=" + nameSong, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        return;
      }
      return response.json();
    })
    .then(async (data) => {
      const fileUrl = `https://cdn.hedystia.com/ms/${data.videoName}`;
      name = data.videoName;
      await wait(30000);
      return waitUntilFileExists(fileUrl);
    })
    .then(async () => {
      bot.sendMessage(
        message.chat,
        {audio: {url: "https://cdn.hedystia.com/ms/" + name}, mimetype: "audio/mpeg", fileName: `${name}`},
        {quoted: message}
      );
    })
    .catch((error) => {
      console.log(error);
    });
};
