const _ = require('lodash');
const moment = require('moment');
const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');
const {getDate, getFullDateName, humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING} = require('./helpers');

const BOLD_CHAR = '\u0002'

const commands = [
    {
        regex: '!vd',
        action: event => {
            const param = event.message.replace(/^!vd\s?/, '')

            const datePattern = /(\d{1,2})[/-](\d{1,2})/

            if (!param) {
                let date = getDate()
                const names = vdLib[date.short]
                const extendedNames = vdExd[date.short]

                event.reply(
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

                event.reply(
                    `Vārda dienu ${getFullDateName(month, day)} `
                    + `svin ${BOLD_CHAR + names.join(', ') + BOLD_CHAR}, `
                    + `kā arī ${extendedNames.join(', ')}.`
                )
            } else {
                const key = _.findKey(vdLib, s => s.indexOf(param) !== -1)
                const extendedKey = key ? null : _.findKey(vdExd, s => s.indexOf(param) !== -1)

                if (!key && !extendedKey) {
                    event.reply(`${param} nesvin.`)
                    return
                }

                let [month, day] = (key || extendedNames).split('-')
                month = +month
                day = +day

                event.reply(`${param} vārda dienu svin ${getFullDateName(month, day)}.`);
            }
        }
    },
    {
        regex: '!ping',
        action: (event) => {
            event.reply('pong');
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
