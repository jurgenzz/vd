const irc = require('irc-framework');
const commands = require('./commands');
const config = require('./config');
const {checkIfExists, removeFromMemory, hypheniphyDate} = require('./helpers');
const client = new irc.Client();
const defaultChannel = config.defaultChannel || '#meeseekeria';
const {vdCheckUp} = require('./vdCheckUp');

let Storage = require('node-storage');

let connectionTime;
let currentChannels = {};
let vdPrinted = false;
const messageCheck = () => {
  setInterval(() => {

    let currentKey = hypheniphyDate(new Date());

    if (currentKey.indexOf('21-22-0') >= 0) {
      if (!vdPrinted) {
        vdPrinted = true;
        if (currentChannels[defaultChannel]) {
          vdCheckUp(currentChannels[defaultChannel], 'say');
        }
      }
    } else {
      vdPrinted = false;
    }

    let replies = checkIfExists(currentKey);

    if (replies && replies.length) {
      replies.map(reply => {
        let currentClient = currentChannels[reply.channel];
        if (currentClient) {
          currentClient.say(`${reply.nick}, a reminder for you: '${reply.message}'`);
        }
      })
      removeFromMemory(currentKey);
    }
  }, 1)
}

client.connect({
  host: config.host,
  port: config.port,
  nick: config.nick,
  username: config.username,
  password: config.password,
  tls: config.tls,
  auto_reconnect: true,
  auto_reconnect_wait: 1000,
  auto_reconnect_max_retries: 1000
});

client.on('close', () => {
  console.log('client.close called!');
  process.exit(1);
});

client.on('registered', () => {
  connectionTime = new Date()
  // console.log('hehe')
  config.channels.map(channel => {
    let currentChannel = client.channel(channel);
    currentChannels[channel] = currentChannel;
    console.log(`Joining ${channel}`);
    currentChannel.join();
  })
  messageCheck()
});

const resolveMessage = (event, replyToUser, originalEvent) => {

  commands.map(command => {
    if(event.message.match(command.regex) && event.message.indexOf(command.regex) === 0) {
      command.action(event, {connectionTime, replyToUser});
      return;
    }
  })

  let db = new Storage('../db');
  let UIcommands = db.get('commands');
  if (UIcommands) {
    UIcommands = JSON.parse(UIcommands);
  }
  let uiMessage = event.message.split(' ').slice(1);
  uiMessage = uiMessage.join(' ')
  const cmd = event.message.split(' ')[0];

  if (UIcommands[cmd]) {
    const reply = UIcommands[cmd].replace(/{param}/, uiMessage).replace(/{nick}/, event.nick);
    event.reply(reply);
  }
}

client.on('message', (event) => {
  let message = event.message;
  let eventToUse = Object.assign({}, event)
  let replyToUser = false;
  
  // https://developers.lv/47f88266-90d2-4e20-abe9-9b06a3646aa7
  const nickPattern = new RegExp(`^${config.nick}[,:]{1} ?`)
  if (nickPattern.test(message)) {
    replyToUser = true;
    eventToUse.message = eventToUse.message.replace(nickPattern, '!');
  }
  resolveMessage(eventToUse, replyToUser, event);
})
