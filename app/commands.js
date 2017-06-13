const _ = require('lodash');
const moment = require('moment');
const {humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING} = require('./helpers');
const {vdCheckUp} = require('./vdCheckUp');

const commands = [
  {
    regex: '!vd',
    action: event => vdCheckUp(event, 'reply')
  },
  {
    regex: '!echo',
    action: event => {
      if (event.nick.match(/zn|msks|vdk|cbot_git|Xn/)) {
        return;
      }
      let reply = event.message.replace(/!echo/, '');
      event.reply(reply);
    }
  },
  {
    regex: '!ping',
    action: (event, {replyToUser}) => {
      let reply = replyToUser ? `${event.nick}, pong!` : 'pong'
      event.reply(reply);
    }
  },
  {
    regex: '!uptime',
    action: (event, {connectionTime}) => {
      const now = new Date()
      let timeUp = humanizeDelta(now - connectionTime);
      event.reply(timeUp);
    }
  },
  {
    regex: '!remind',
    action: (event) => {
      let msg = event.message
      let nick = event.nick
      let channel = event.target
      let timeStamp = event.message.split(' ')[1] // returns 7d4h, 7d, 1d, 2w,
      msg = msg.replace(/!remind/g, '').replace(timeStamp, '').replace(/\s+/, '')

      // days / week / hour / match
      if (!timeStamp) {
        return
      }

      let dates = timeStamp.match(/\d+[wdhms]/g)
      let seconds = _.reduce(dates, (seconds, date) => {
        return seconds + date.match(/\d+/)[0] * DURATION_MAPPING[date.match(/[a-z]/)]
      }, 0)

      if (seconds / DURATION_MAPPING['d'] > 50) {
        event.reply(`Sorry ${nick}, memory limited to 50 days.`)
        return
      }

      let when = new Date(moment().add(seconds, 'seconds').valueOf())
      storeDate(hypheniphyDate(when), nick, msg, channel)

      let after = _.join(humanizeDelta(seconds * 1000).split(' '), ', ')
      event.reply(`A reminder has been set. Will remind you in ${after}`)
    }
  }
]

module.exports = commands;
