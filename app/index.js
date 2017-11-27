const {Commands} = require('./Commands');

class VdkClass {
  constructor() {
    this.registered = null;
    this.client = null;
    this.channels = {};
    this.config = {}
    this.messages = [];
  }
  /**
   *
   * @param {*} ircClient
   */

  setClient(ircClient, config) {
    this.client = ircClient;
    this.config = config;
  }

  /**
   *
   * @param {Array} channels
   */
  joinChannels(channels) {
    if (!this.client) {
      return;
    }

    console.log('joining channels');
    channels.map(channel => {
      let currentChannel = this.client.channel(channel);
      this.addChannel(channel, currentChannel);
      currentChannel.join();
    });
  }

  /**
   *
   * @param {string} name
   * @param {*} channel
   */
  addChannel(name, channel) {
    this.channels[name] = channel;
  }

  /**
   * 
   * @param {*} event 
   */
  isMe(event) {
    return event.nick === this.config.nick;
  }

  /**
   * 
   * @param {string} message 
   */
  storeMessage(message) {
    //TODO: save last 50 only
    this.messages.push[message]
  }

  /**
   *
   * @param {*} event
   */
  handleMessage(event) {
    let {message} = event;
    this.storeMessage(message);
    if (this.isMe(event)) {
      return;
    }

    let isCommand = message.match(/^!\w+/);

    if (!isCommand || !isCommand[0]) {
      return;
    }

    let cmd = isCommand[0]
    
    Commands.handleCommand(cmd, message, event);
    
  }
}

let vdk = new VdkClass();
module.exports = { vdk };
