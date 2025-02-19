const { default: Database } = require("@hedystia/db");
const fs = require("fs");
const packageData = require("./package.json");
const migrationDB = require("./src/db/migrations");

const migrations = new Database("./src/db/store/migrations.ht", packageData.author);

const config = new Database("./src/db/store/config.ht", packageData.author);

const executeDBCode = new Promise((resolve) => {
  (async () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log("\x1b[97mReviewing database\x1b[0m");
    if (!fs.existsSync("./src/db/store/migrations.ht")) {
      console.log("\n");
      console.log("\x1b[97mStarting the creation of the migrations table\x1b[0m");
      console.log("");
      migrations.createTable("version", ["date"]);
      console.log("\x1b[95mThe creation of the migration table has been completed\x1b[0m");
    }
    await migrationDB(migrations, config);
    console.log("\n");
    console.log("\x1b[92mI finish the review of the database\x1b[0m");
    resolve();
  })();
});

module.exports = { config, executeDBCode };
