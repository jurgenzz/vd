const { cmdList } = require("./cmdList");

class CommandsClass {
  /**
   *
   * @param {string} command
   * @param {string} message
   * @param {string} event
   * @param {Class} vdk
   */
  handleCommand(command, message, event, vdk) {
    if (command && cmdList[command]) {
      cmdList[command](message, event, vdk);
    }
  }

  /**
   *
   */
  handleCommandFromStorage() {}
}

let Commands = new CommandsClass();
module.exports = { Commands };
