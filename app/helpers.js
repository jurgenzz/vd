const _ = require('lodash');
const monthNames = ['janvārī', 'februārī', 'martā', 'aprīlī', 'maijā', 'jūnijā', 'jūlijā', 'augustā', 'septembrī', 'oktobrī', 'novembrī', 'decembrī'];


const getDate = () => {
    let current = new Date();
    let month = current.getMonth() + 1;
    let day = current.getDate();

    let fullDate = `${day}. ${monthNames[month - 1]}`

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return {
        short: month + '-' + day,
        full: fullDate,
        monthNames: monthNames
    }
}

const humanizeDelta = (delta) => {
  // Turns `12345678` into `3h 25m 45s`.

  const DURATION_MAPPING = {
    y: 1000 * 60 * 60 * 24 * 365,
    // mn: 1000 * 60 * 60 * 24 * 30,
    // w: 1000 * 60 * 60 * 24 * 7,
    d: 1000 * 60 * 60 * 24,
    h: 1000 * 60 * 60,
    m: 1000 * 60,
    s: 1000,
    // ms: 1,
  }

  let d = delta
  let durations = []
  _.forEach(DURATION_MAPPING, (duration, durationKey) => {
    if (duration <= d) {
      let count = _.floor(d / duration)

      d -= duration * count

      durations.push([durationKey, count])
    }
  })

  return _.join(_.map(durations, ([name, count]) => `${count}${name}`), ' ')
}

module.exports = {
  humanizeDelta,
  getDate
}
