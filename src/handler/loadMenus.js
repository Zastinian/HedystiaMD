function loadMenus(bot) {
  const fs = require("fs");
  const menuFolders = fs.readdirSync("./src/menus");
  for (const folder of menuFolders) {
    const menuFiles = fs.readdirSync(`./src/menus/${folder}`).filter((file) => file.endsWith(".js"));
    for (const file of menuFiles) {
      const menu = require(`../menus/${folder}/${file}`);
      if (menu.name) {
        bot.menus.set(menu.name, menu);
      } else {
        continue;
      }
    }
  }
}
module.exports = loadMenus;
