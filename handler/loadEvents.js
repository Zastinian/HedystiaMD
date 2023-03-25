const allEvent = (event) => require(`../events/all/${event}`);

function loadEvents(bot) {
  bot.onAnyMessage((message) => allEvent("command")(message, bot));
}
module.exports = loadEvents;
