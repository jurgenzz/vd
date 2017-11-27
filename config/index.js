const {prod} = require('./prod.config')

const APP_CONFIG = {
  host: prod.host || "chat.freenode.net",
  port: prod.port || 6667,
  nick: prod.nick || "vdk_bot",
  username: prod.username || "",
  password: prod.password || "",
  tls: !!prod.tls ? prod.tls : false,
  channels: prod.channels || ["#meeseekeria"],
  auto_reconnect: true,
  auto_reconnect_wait: 1000,
  auto_reconnect_max_retries: 1000
}

module.exports = {APP_CONFIG}