const { cmdList } = require('./cmdList');
const { APP_CONFIG } = require('../config');
let Storage = require('node-storage');

class CommandsClass {
  constructor() {
    this.lastCommand = null;
    this.lastCommandByUser = {};

    this.history = {
      '!last': event => {
        if (!this.lastCommand) {
          return;
        }
        let { command, message } = this.lastCommand;
        this.handleCommand(command, message, event, {}, true);
      },
      '!mlast': event => {
        let { nick } = event;
        if (this.lastCommandByUser[nick]) {
          let { command, message } = this.lastCommandByUser[nick];
          this.handleCommand(command, message, event, {}, true);
        }
      }
    };
  }

  /**
   *
   * @param {string} command
   * @param {string} message
   * @param {string} event
   */
  storeCommand(command, message, event) {
    this.lastCommand = { command, message };
    if (event.nick !== APP_CONFIG.nick) {
      this.lastCommandByUser[event.nick] = {
        command,
        message
      };
    }
  }

  /**
   *
   * @param {string} command
   * @param {string} message
   * @param {string} event
   * @param {Class} vdk
   */
  handleCommand(command, message, event, vdk, ignoreStoring) {
    if (command && cmdList[command]) {
      cmdList[command](message, event, vdk);
      if (!ignoreStoring) {
        this.storeCommand(command, message, event);
      }
    } else {
      if (this.history[command]) {
        this.history[command](event);
        return;
      }
      let commandSuccessful = this.handleCommandFromStorage(command, message, event);
      if (commandSuccessful && !ignoreStoring) {
        this.storeCommand(command, message, event);
      }
    }
  }

  /**
   *
   * @param {string} command
   * @param {string} event
   */
  handleCommandFromStorage(command, message, event) {
    let db = new Storage('../db');
    let UIcommands = db.get('commands');
    if (UIcommands) {
      UIcommands = JSON.parse(UIcommands);
    }
    let uiMessage = message.split(' ').slice(1);
    uiMessage = uiMessage.join(' ');

    if (UIcommands[command]) {
      const reply = UIcommands[command]
        .replace(/{urlParam}/, encodeURIComponent(uiMessage))
        .replace(/{param}/, uiMessage)
        .replace(/{nick}/, event.nick);
      event.reply(reply);
      return true;
    }
    return false;
  }
}

let Commands = new CommandsClass();
module.exports = { Commands };
