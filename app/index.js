const irc = require('irc-framework');
const commands = require('./commands');
const config = require('./config');
const {checkIfExists, removeFromMemory, hypheniphyDate} = require('./helpers');
const client = new irc.Client();

let connectionTime;
let currentChannels = {};

const messageCheck = () => {
    setInterval(() => {
        let rememberDateKey = new Date();
        let currentKey = hypheniphyDate(rememberDateKey);

        let reply = checkIfExists(currentKey);
        if (reply) {
            let currentClient = currentChannels[reply.channel];
            if (currentClient) {
                currentClient.say(`${reply.nick}, a reminder for you: '${reply.message}'`);
                removeFromMemory(currentKey);
            }
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
    console.log('hehe')
    config.channels.map(channel => {
        let currentChannel = client.channel(channel);
        currentChannels[channel] = currentChannel;
        console.log(`Joining ${channel}`);
        currentChannel.join();
    })
    messageCheck()
});

client.on('message', (e) => {
    commands.map(command => {
        if(e.message.match(command.regex) && e.message.indexOf(command.regex) === 0) {
            command.action(e, {connectionTime: connectionTime});
        }
    })
})
