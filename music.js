const {MessageMedia} = require("whatsapp-web.js");
const download = require("./assets/Download");
const wait = require("./assets/Wait");
const {globalMusicCooldown} = require("./config");
const fs = require("fs").promises;

let global = false;

module.exports = function (ms, message, lang) {
  if (global == true) {
    return message.reply(lang.play.cooldown);
  }
  message.reply(lang.play.info);
  function waitUntilFileExists(fileUrl, interval = 2000, retries = 10) {
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
                if (globalMusicCooldown) {
                  global = false;
                }
                return message.reply(lang.play.error);
              } else {
                setTimeout(checkFile, interval);
              }
            }
          })
          .catch((error) => {
            retryCount++;
            if (retryCount >= retries) {
              if (globalMusicCooldown) {
                global = false;
              }
              return message.reply(lang.play.error);
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
        return message.reply(lang.play.error);
      }
      return response.json();
    })
    .then(async (data) => {
      if (globalMusicCooldown) {
        global = true;
      }
      const fileUrl = `https://cdn.mresmile.com/ms/${data.videoName}`;
      name = data.videoName;
      await wait(30000);
      return waitUntilFileExists(fileUrl);
    })
    .then(async () => {
      download("https://cdn.mresmile.com/ms/" + name, "./").on("close", async () => {
        const media = MessageMedia.fromFilePath("./" + name);
        message.reply(media).then(async () => {
          await wait(5000);
          if (globalMusicCooldown) {
            global = false;
          }
          await fs.unlink("./" + name);
        });
      });
    })
    .catch((error) => {
      console.log(error);
      message.reply(lang.play.error);
    });
};
