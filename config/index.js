let config = {};
try {
  const prod = require('./prod.config')
  config = prod;
} catch (err) {
 // err
}

const APP_CONFIG = {
  host: config.host || 'chat.freenode.net',
  port: config.port || 6667,
  nick: config.nick || 'vdk_dev',
  username: config.username || 'vdk_dev',
  password: config.password || '',
  tls: !!config.tls ? config.tls : false,
  channels: config.channels || ['#meeseekeria'],
  defaultChannel: config.defaultChannel || '#meeseekeria',
  auto_reconnect: true,
  auto_reconnect_wait: 1000,
  auto_reconnect_max_retries: 1000,
  weatherAPI: '7959704cf8fb4f17f6d594ca3e433ab1'
};

module.exports = { APP_CONFIG };
