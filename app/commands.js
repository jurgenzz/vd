const _ = require('lodash');
const moment = require('moment');
const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');
const {getDate, humanizeDelta, storeDate, hypheniphyDate, DURATION_MAPPING} = require('./helpers');

const BOLD_CHAR = '\u0002'

const commands = [
    {
        regex: '!vd',
        action: (event) => {
            let date = getDate();
            let shortDate = date.short;
            let longDate = date.full;
            let vdList = vdLib[shortDate].join(', ');

            let msg = event.message.split(' ');

            if (msg.length === 2 && msg[1] !== 'full') {
                let name = msg[1];
                let nameFound = false;
                Object.keys(vdLib).map(key => {
                    if (vdLib[key].indexOf(name) >= 0 || vdExd[key] && vdExd[key].indexOf(name) >= 0) {
                        let vdMonth = parseFloat(key.split('-')[0]);
                        let vdDay = parseFloat(key.split('-')[1]);
                        let monthName = date.monthNames[vdMonth - 1];
                        event.reply(`${name} vārda dienu svin ${vdDay}. ${monthName}.`);
                        nameFound = true;
                    }
                })
                if (!nameFound) {
                    event.reply(`${name} nesvin.`)
                }
            } else {
                let vdExdended = vdExd[shortDate].join(', ');
                event.reply(`Vārda dienu šodien, ${longDate}, svin ${BOLD_CHAR + vdList + BOLD_CHAR}, kā arī ${vdExdended}.`);
                // return;
                // if (msg[1] === 'full') {
                //
                // } else {
                //     event.reply(`Vārda dienu šodien, ${longDate}, svin ${vdList}.`);
                // }
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
            console.log(event);
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
