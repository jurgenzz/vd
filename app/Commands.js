const { cmdList } = require("./cmdList");

class CommandsClass {
  /**
   *
   * @param {string} command
   * @param {string} message
   * @param {string} event
   */
  handleCommand(command, message, event) {
    if (command && cmdList[command]) {
      cmdList[command](message, event);
    }
  }

  /**
   *
   */
  handleCommandFromStorage() {}
}

let Commands = new CommandsClass();
module.exports = { Commands };
