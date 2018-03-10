const _ = require('lodash');
const moment = require('moment');

const { humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING, getDate } = require('../helpers');

/**
 *
 * @param {*} message
 * @param {*} event
 */
const reminder = (message, event) => {
  let nick = event.nick;
  let channel = event.target;
  let timeStamp = message.split(' ')[1]; // returns 7d4h, 7d, 1d, 2w,
  message = message
    .replace(/!remind/g, '')
    .replace(timeStamp, '')
    .replace(/\s+/, '');

  // days / week / hour / match
  if (!timeStamp) {
    return;
  }

  let dates = timeStamp.match(/\d+[wdhms]/g);
  let seconds = _.reduce(
    dates,
    (seconds, date) => {
      return seconds + date.match(/\d+/)[0] * DURATION_MAPPING[date.match(/[a-z]/)];
    },
    0
  );

  let when = new Date(
    moment()
      .add(seconds, 'seconds')
      .valueOf()
  );
  storeDate(hypheniphyDate(when), nick, message, channel);

  let after = _.join(humanizeDelta(seconds * 1000).split(' '), ', ');

  if (seconds / DURATION_MAPPING['d'] > 50) {
    event.reply(`A reminder has been set. Will try to remind you in ${after}.`);
  } else {
    event.reply(`A reminder has been set. Will remind you in ${after}.`);
  }
};

module.exports = {
  reminder
};
