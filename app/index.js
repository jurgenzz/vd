const irc = require('irc-framework');
const commands = require('./commands');
const config = require('./config');

const client = new irc.Client();

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
    config.channels.map(channel => {
        console.log(`Joining ${channel}`);
        client.join(channel);
    })
});

client.on('message', (e) => {
    commands.map(command => {
        if(e.message.match(command.regex) && e.message.indexOf(command.regex) === 0) {
            command.action(e);
        }
    })
})
