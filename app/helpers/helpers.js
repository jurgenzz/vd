const _ = require('lodash');
const fs = require('fs');

const BOLD_CHAR = '\u0002'

let reminders = {}
try {
    reminders = require('../../temp/reminders')
} catch (err) {
    console.log('WARNING: Could not find temp/reminders, creating instead')
    fs.writeFile('temp/reminders.json', JSON.stringify({}), err => {
      // err
    });
}

const monthNames = ['janvārī', 'februārī', 'martā', 'aprīlī', 'maijā', 'jūnijā', 'jūlijā', 'augustā', 'septembrī', 'oktobrī', 'novembrī', 'decembrī'];

const getFullDateName = (month, day) => `${day}. ${monthNames[month - 1]}`

const getDate = () => {
    let current = new Date();
    let month = current.getMonth() + 1;
    let day = current.getDate();

    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    return {
        short: month + '-' + day,
        full: getFullDateName(month, day),
        monthNames: monthNames,
    }
}

const DURATION_MAPPING = {
    y: 60 * 60 * 24 * 365,
    w: 60 * 60 * 24 * 7,
    d: 60 * 60 * 24,
    h: 60 * 60,
    m: 60,
    s: 1,
}

const humanizeDelta = (delta) => {
    // Turns `12345678` into `3h 25m 45s`.

    let d = delta
    let durations = []
    _.forEach(DURATION_MAPPING, (duration, durationKey) => {
        if (duration <= d) {
            duration *= 1000
            let count = _.floor(d / duration)

            d -= duration * count
            if (count) {
                durations.push([durationKey, count])
            }
        }
    })

    return _.join(_.map(durations, ([name, count]) => `${count}${name}`), ' ')
}

const storeDate = (date, nick, message, channel) => {
    const newReminders = reminders || {};
    newReminders[date] = newReminders[date] || [];
    newReminders[date].push({
        nick: nick,
        message: message,
        channel: channel
    })
    fs.writeFile('temp/reminders.json', JSON.stringify(newReminders));
}

const checkIfExists = (date) => {
    return reminders[date];
}

const removeFromMemory = (date) => {
    let newReminders = reminders || {};
    delete newReminders[date];
    fs.writeFile('temp/reminders.json', JSON.stringify(newReminders));
}

const hypheniphyDate = (date) => {
    return _.join(_.map(
        ['getMonth', 'getDate', 'getHours', 'getMinutes', 'getSeconds'],
        m => date[m]()
    ), '-')
}



module.exports = {
    humanizeDelta,
    getFullDateName,
    getDate,
    storeDate,
    removeFromMemory,
    checkIfExists,
    hypheniphyDate,
    DURATION_MAPPING
}