// const {prod} = require('./prod.config')
const prod = {};

const APP_CONFIG = {
  host: prod.host || 'chat.freenode.net',
  port: prod.port || 6667,
  nick: prod.nick || 'vdk_dev2',
  username: prod.username || 'vdk_dev2',
  password: prod.password || '',
  tls: !!prod.tls ? prod.tls : false,
  channels: prod.channels || ['#meeseekeria'],
  defaultChannel: '#meeseekeria',
  auto_reconnect: true,
  auto_reconnect_wait: 1000,
  auto_reconnect_max_retries: 1000,
  weatherAPI: '7959704cf8fb4f17f6d594ca3e433ab1'
};

module.exports = { APP_CONFIG };
