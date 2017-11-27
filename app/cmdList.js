const {vdCheckUp} = require('./helpers/vdCheckUp');

const cmdList = {
  '!ping': (message, event) => event.reply('pong!'),
  '!vd': vdCheckUp
}

module.exports = {cmdList}