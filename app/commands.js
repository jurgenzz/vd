const { cmdList } = require("./cmdList");
let Storage = require("node-storage");

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
    } else {
      this.handleCommandFromStorage(command, event)
    }
  }

  /**
   *
   * @param {string} command
   * @param {string} event
   */
  handleCommandFromStorage(command, event) {
    let db = new Storage("../db");
    let UIcommands = db.get("commands");
    if (UIcommands) {
      UIcommands = JSON.parse(UIcommands);
    }
    let uiMessage = event.message.split(" ").slice(1);
    uiMessage = uiMessage.join(" ");
    const cmd = event.message.split(" ")[0];
  
    if (UIcommands[cmd]) {
      const reply = UIcommands[cmd]
        .replace(/{urlParam}/, encodeURIComponent(uiMessage))
        .replace(/{param}/, uiMessage)
        .replace(/{nick}/, event.nick);
      event.reply(reply);
    }
  }
}

let Commands = new CommandsClass();
module.exports = { Commands };
