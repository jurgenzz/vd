const irc = require("irc-framework");
const {vdk} = require('./app')
const {APP_CONFIG} = require('./config')

const client = new irc.Client();

client.connect(APP_CONFIG)

client.on('close', () => {
  console.log('connection close');
  process.exit(1);
})

vdk.setClient(client, APP_CONFIG);

client.on("registered", () => {
  console.log('client registered');
  vdk.joinChannels(APP_CONFIG.channels);
});


client.on("message", event => {
  vdk.handleMessage(event);
});