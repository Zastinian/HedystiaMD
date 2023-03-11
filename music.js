const {MessageMedia} = require("whatsapp-web.js");
const download = require("./assets/Download");
const wait = require("./assets/Wait");
const fs = require("fs").promises;

module.exports = function (ms, message) {
  function waitUntilFileExists(fileUrl, interval = 2000, retries = 50) {
    return new Promise((resolve, reject) => {
      let retryCount = 0;
      const checkFile = () => {
        fetch(fileUrl, {method: "HEAD"})
          .then((response) => {
            if (response.ok) {
              resolve();
            } else {
              retryCount++;
              if (retryCount >= retries) {
                return;
              } else {
                setTimeout(checkFile, interval);
              }
            }
          })
          .catch((error) => {
            retryCount++;
            if (retryCount >= retries) {
              return;
            } else {
              setTimeout(checkFile, interval);
            }
          });
      };
      checkFile();
    });
  }
  let name;
  const nameSong = encodeURIComponent(ms);
  fetch("https://cdn.mresmile.com/create-au?songName=" + nameSong, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log(response);
        return;
      }
      return response.json();
    })
    .then(async (data) => {
      const fileUrl = `https://cdn.mresmile.com/ms/${data.videoName}`;
      name = data.videoName;
      await wait(30000);
      return waitUntilFileExists(fileUrl);
    })
    .then(async () => {
      download("https://cdn.mresmile.com/ms/" + name, "./").on("close", async () => {
        const media = MessageMedia.fromFilePath("./" + name);
        message.reply(media).then(async () => {
          await wait(2000);
          await fs.unlink("./" + name);
        });
      });
    })
    .catch((error) => {
      console.log(error);
      message.reply(lang.play.error);
    });
};
