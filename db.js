const Database = require("@hedystia/db");
const fs = require("fs");
const packageData = require("./package.json");
const wait = require("./src/util/wait");
const printText = require("./src/util/printText");
const migrationDB = require("./src/db/migrations");

const P = [
  "\x1b[96m(ノಠ益ಠ)ノ彡\x1b[97m┻━┻\x1b[0m",
  "\x1b[96m(ノಠ益ಠ)ノ彡\x1b[97m ┻━┻\x1b[0m",
  "\x1b[96m(ノಠ益ಠ)ノ彡\x1b[97m  ┻━┻\x1b[0m",
  "\x1b[96m(ノಠ益ಠ)ノ彡\x1b[97m   ┻━┻\x1b[0m",
  "\x1b[96m(ノಠ益ಠ)ノ彡\x1b[97m    ┬─┬\x1b[0m",
  "\x1b[97m ┬─┬ \x1b[96mノ( ゜-゜ノ)\x1b[0m",
  "\x1b[97m ┬━┬ \x1b[96mノ( ゜-゜ノ)\x1b[0m",
];
let x = 0;

const loader = setInterval(() => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`\x1b[96m${P[x]}\x1b[0m`);
  x = (x + 1) % P.length;
}, 500);

const migrations = new Database("./src/db/store/migrations.ht", packageData.author);

const config = new Database("./src/db/store/config.ht", packageData.author);

const executeDBCode = new Promise((resolve) => {
  setTimeout(async () => {
    clearInterval(loader);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    const checkDB = "\x1b[97mReviewing database\x1b[0m";
    printText(checkDB, 0);
    await wait(checkDB.length * 100 + 1000);
    if (!fs.existsSync("./src/db/store/migrations.ht")) {
      console.log("\n");
      const migrationStart = "\x1b[97mStarting the creation of the migrations table\x1b[0m";
      printText(migrationStart, 0);
      await wait(migrationStart.length * 100 + 1000);
      console.log("");
      migrations.createTable("version", ["date"]);
      const migrationDone = "\x1b[95mThe creation of the migration table has been completed\x1b[0m";
      printText(migrationDone, 0);
      await wait(migrationDone.length * 100 + 1000);
    }
    await migrationDB(migrations, config);
    console.log("\n");
    const checkDBDone = "\x1b[92mI finish the review of the database\x1b[0m";
    printText(checkDBDone, 0);
    await wait(checkDBDone.length * 100 + 1000);
    resolve();
  }, 10000);
});

module.exports = { config, executeDBCode };
