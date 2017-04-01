const vdLib = require('./vd.json')
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

            if (msg.length === 2) {
                let name = msg[1];
                let nameFound = false;
                Object.keys(vdLib).map(key => {
                    if (vdLib[key].indexOf(name) >= 0) {
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
                event.reply(`Vārda dienu šodien, ${longDate}, svin ${vdList}.`);
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
