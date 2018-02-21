const { vdCheckUp } = require('./actions/vdCheckUp');
const { reminder } = require('./actions/reminder');
const { weatherCheck } = require('./actions/weatherCheck');
const { crypto } = require('./actions/crypto');
const { humanizeDelta } = require('./helpers');
const { search } = require('./actions/search');
const { count } = require('./actions/count');

const cmdList = {
  '!ping': (message, event) => event.reply('pong!'),
  '!vd': (message, event) => vdCheckUp(message, event),
  '!echo': (message, event) => {
    if (event.nick.match(/zn|msks|vdk|cbot_git|Xn/)) {
      return;
    }
    let reply = message.replace(/!echo /, '');
    event.reply(reply);
  },
  '!remind': reminder,
  '!weather': weatherCheck,
  '!uptime': (message, event, vdk) => {
    const now = new Date();
    const connectionTime = vdk.getUptime();
    let timeUp = humanizeDelta(now - connectionTime);
    event.reply(timeUp);
  },
  '!crypto': (message, event) => crypto(message, event, false),
  '!coinbase': (message, event) => crypto(message, event, true),
  '!search': search,
  '!count': count
};

module.exports = { cmdList };
