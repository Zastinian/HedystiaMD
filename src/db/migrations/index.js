module.exports = async (migrations, config) => {
  migrations.enableMigrations();
  await migrations.createMigration(
    {
      id: "2024-05-09T00:20:59.327Z",
      description: "Initial migration",
      timestamp: Date.now(),
    },
    async () => {
      console.log("\n");
      console.log("\x1b[97mCreating the migrations 2024-05-09T00:20:59.327Z\x1b[0m");
      const migration = require("./2024-05-09T00-20-59.327Z");
      await migration(config);
      console.log("");
      console.log(
        "\x1b[95mThe creation of the  migrations 2024-05-09T00:20:59.327Z has been completed\x1b[0m",
      );
    },
  );
};
