module.exports = async (migrations, config) => {
  const m = require("./2024-05-09T00-20-59.327Z");
  if (!migrations.select("version", { date: m.date })[0]) {
    console.log("\n");
    console.log(`\x1b[97mCreating the migrations ${m.date}\x1b[0m`);
    console.log("");
    switch (m.type) {
      case "config":
        await m.run(migrations, config);
        break;
    }
    console.log("");
    console.log(`\x1b[95mThe creation of the  migrations ${m.date} has been completed\x1b[0m`);
  }
};
