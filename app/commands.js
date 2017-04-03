const vdLib = require('./vd.json')
const vdExd = require('./vd_exd.json');
const getDate = require('./helpers');


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
                if (msg[1] === 'full') {
                    let vdExdended = vdExd[shortDate].join(', ');
                    event.reply(`Vārda dienu šodien, ${longDate}, svin ${vdList}, kā arī ${vdExdended}.`);
                } else {
                    event.reply(`Vārda dienu šodien, ${longDate}, svin ${vdList}.`);
                }
            }

        }
    },
    {
        regex: '!ping',
        action: (event) => {
             event.reply('pong');
        }
    }

]


module.exports = commands;
