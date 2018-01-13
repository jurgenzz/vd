const { Commands } = require('./Commands');
const { APP_CONFIG } = require('../config');
const {
  hypheniphyDate,
  checkIfExists,
  removeFromMemory
} = require('./helpers');
const { vdCheckUp } = require('./actions/vdCheckUp');

class VdkClass {
  constructor() {
    this.registered = null;
    this.client = null;
    this.channels = {};
    this.config = {};
    this.messages = [];
    this.uptime = 0;
  }
  /**
   *
   * @param {*} ircClient
   */

  setClient(ircClient, config) {
    this.client = ircClient;
    this.config = config;
    this.defaultChannel = config.defaultChannel;
    this.uptime = new Date().getTime();
  }

  /**
   *
   */

  getUptime() {
    return this.uptime;
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
    this.messageCheck();
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
    // this.messages.push[message];
  }

  /**
   *
   * @param {*} event
   */
  handleMessage(event) {
    let { message } = event;
    this.storeMessage(message);
    if (this.isMe(event)) {
      return;
    }

    // https://developers.lv/47f88266-90d2-4e20-abe9-9b06a3646aa7
    const nickPattern = new RegExp(`^${APP_CONFIG.nick}[,:]{1} ?`);

    if (nickPattern.test(message)) {
      message = message.replace(nickPattern, '!');
    }

    let isCommand = message.match(/^!\w+/);

    if (!isCommand || !isCommand[0]) {
      return;
    }

    let cmd = isCommand[0];

    Commands.handleCommand(cmd, message, event, this);
  }

  messageCheck() {
    let { channels, defaultChannel } = this;
    setInterval(() => {
      let currentDateTime = hypheniphyDate(new Date());

      if (currentDateTime.indexOf('9-0-0') >= 0) {
        if (!this.vdPrinted) {
          this.vdPrinted = true;
          if (channels[defaultChannel]) {
            vdCheckUp(null, channels[defaultChannel], 'say');
          }
        }
      } else {
        this.vdPrinted = false;
      }

      let replies = checkIfExists(currentDateTime);

      if (replies && replies.length) {
        replies.map(reply => {
          let currentClient = channels[reply.channel];
          if (currentClient) {
            currentClient.say(
              `${reply.nick}, a reminder for you: '${reply.message}'`
            );
          }
        });
        removeFromMemory(currentDateTime);
      }
    }, 1);
  }
}

let vdk = new VdkClass();
module.exports = { vdk };
