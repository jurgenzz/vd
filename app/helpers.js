const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const reminders = require('../temp/reminders');
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

const createDateToRemember = ({days, hours, mins, seconds}) => {
    let dateToRemember = moment().add({days: days, minutes: mins, hours: hours, seconds:seconds})
    return dateToRemember.valueOf();
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

module.exports = {
    humanizeDelta,
    getDate,
    createDateToRemember,
    storeDate,
    removeFromMemory,
    checkIfExists
}
