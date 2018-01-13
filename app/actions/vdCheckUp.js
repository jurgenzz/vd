const _ = require('lodash');
const vdLib = require('../helpers/data/vd.json');
const vdExtended = require('../helpers/data/vd_extended.json');
const { humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING, getFullDateName, getDate } = require('../helpers');

const BOLD_CHAR = '\u0002';

const vdCheckUp = (message, event, action = 'reply') => {
  const param = message && message.replace(/^!vd\s?/, '');

  const datePattern = /(\d{1,2})[/-](\d{1,2})/;

  if (!param) {
    let date = getDate();
    const names = vdLib[date.short];
    const extendedNames = vdExtended[date.short];

    event[action](
      `Vārda dienu šodien, ${date.full}, ` +
        `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, ` +
        (extendedNames.length > 0 ? `kā arī ${extendedNames.join(', ')}.` : '')
    );
  } else if (datePattern.test(param)) {
    let [input, day, month] = param.match(datePattern);
    let paddedMonth = _.padStart(month, 2, '0');
    let paddedDay = _.padStart(day, 2, '0');

    const key = `${paddedMonth}-${paddedDay}`;

    const names = vdLib[key];
    const extendedNames = vdExtended[key];
    if (!names || !extendedNames) {
      return;
    }

    event[action](
      `Vārda dienu ${getFullDateName(month, day)} ` +
        `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, ` +
        (extendedNames.length > 0 ? `kā arī ${extendedNames.join(', ')}.` : '')
    );
  } else {
    const key = _.findKey(vdLib, s => {
      s = s.map(v => v.toLowerCase());
      let lowerParam = param.toLowerCase();
      return s.indexOf(param) !== -1;
    });
    const extendedKey = key
      ? null
      : _.findKey(vdExtended, s => {
          s = s.map(v => v.toLowerCase());
          let lowerParam = param.toLowerCase();
          return s.indexOf(param) !== -1;
        });

    if (!key && !extendedKey) {
      event[action](`${param} nesvin.`);
      return ``;
    }

    let [month, day] = (key || extendedKey).split('-');
    month = +month;
    day = +day;

    event[action](`${param} vārda dienu svin ${getFullDateName(month, day)}.`);
  }
};

module.exports = {
  vdCheckUp
};
