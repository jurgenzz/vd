const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');
const {getDate, humanizeDelta, createDateToRemember, storeDate} = require('./helpers');

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
            let msg = event.message;
            let nick = event.nick
            let channel = event.target;
            let timeStamp = event.message.split(' ')[1] // returns 7d4h, 7d, 1d, 2w,
            msg = msg.replace(/!remind/g, '').replace(timeStamp, '').replace(/\s+/, '');
            // days / week / hour / match
            time = timeStamp.match(/\d+\w/g);
            let weeks = 0;
            let days = 0;
            let hours = 0;
            let mins = 0;
            let seconds = 0;
            if (time && time.length > 0) {
                time.map(value => {
                    let dateType = value.match(/[a-z]/) && value.match(/[a-z]/)[0];
                    switch (dateType) {
                        case 'w': {
                            // how many weeks
                            weeks = value.match(/\d+/)[0];
                            break;
                        }
                        case 'd': {
                            days = value.match(/\d+/)[0];
                            break;
                        }
                        case 'h': {
                            hours = value.match(/\d+/)[0];
                            break;
                        }
                        case 'm': {
                            mins = value.match(/\d+/)[0];
                            break;
                        }
                        case 's': {
                            seconds = value.match(/\d+/)[0];
                        }
                    }
                })
            } else {
                return;
            }
            // add days
            if (seconds >= 60) {
                let secondMinutes = seconds / 60;
                if (secondMinutes >= 1) {
                    mins = Math.floor(mins + secondMinutes);
                    seconds = seconds % 60;
                }
            }

            if (mins >= 60) {
                let minuteHours = mins / 60;
                if (minuteHours >= 1) {
                    hours = Math.floor(hours + minuteHours);
                    mins = mins % 60;
                }
            }

            if (hours >= 24) {
                let hourDays = hours / 24;
                if (hourDays >= 1) {
                    days = Math.floor(days + hourDays);
                    hours = hours % 24;
                }
            }

            if (weeks) {
                days = days + weeks * 7;
            }

            if (days > 50) {
                event.reply(`${nick} sorry, memory limited to 50 days.`);
                return;
            }

            let dateToRemember = createDateToRemember({days, hours, mins, seconds});
            event.reply(`A reminder has been set. Will remind you in ${days}d, ${hours}h, ${mins}m, ${seconds}s`)

            let rememberDateKey = new Date(dateToRemember);
            let currentKey = rememberDateKey.getMonth() + '-' +  rememberDateKey.getDate() + '-' + rememberDateKey.getHours() + '-' + rememberDateKey.getMinutes() + '-' + rememberDateKey.getSeconds();
            storeDate(currentKey, nick, msg, channel);
        }

    }

]


module.exports = commands;
