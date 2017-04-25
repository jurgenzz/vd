const _ = require('lodash');
const fs = require('fs');
const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');

const BOLD_CHAR = '\u0002'

let reminders = {}
try {
    reminders = require('../temp/reminders')
} catch (err) {
    console.log('WARNING: Could not find temp/reminders')
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
    // mn: 60 * 60 * 24 * 30,
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
    newReminders[date] = {
        nick: nick,
        message: message,
        channel: channel
    }
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


const nameDayAction = (event, action) => {
    const param = event.message && event.message.replace(/^!vd\s?/, '');

    const datePattern = /(\d{1,2})[/-](\d{1,2})/

    if (!param) {
        let date = getDate()
        const names = vdLib[date.short]
        const extendedNames = vdExd[date.short]

        event[action](
            `Vārda dienu šodien, ${date.full}, `
            + `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, `
            + `kā arī ${extendedNames.join(', ')}.`
        )
    } else if (datePattern.test(param)) {
        let [input, month, day] = param.match(datePattern)
        month = _.padStart(month, 2, '0')
        day = _.padStart(day, 2, '0')

        const key = `${month}-${day}`

        const names = vdLib[key]
        const extendedNames = vdExd[key]
        if (!names || !extendedNames) {
            return
        }

        event[action](
            `Vārda dienu ${getFullDateName(month, day)} `
            + `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, `
            + `kā arī ${extendedNames.join(', ')}.`
        )
    } else {
        const key = _.findKey(vdLib, s => s.indexOf(param) !== -1)
        const extendedKey = key ? null : _.findKey(vdExd, s => s.indexOf(param) !== -1)

        if (!key && !extendedKey) {
            event[action](`${param} nesvin.`)
            return
        }

        let [month, day] = (key || extendedNames).split('-')
        month = +month
        day = +day

        event[action](`${param} vārda dienu svin ${getFullDateName(month, day)}.`);
    }
}

module.exports = {
    humanizeDelta,
    getFullDateName,
    getDate,
    storeDate,
    removeFromMemory,
    checkIfExists,
    hypheniphyDate,
    nameDayAction,
    DURATION_MAPPING
}
