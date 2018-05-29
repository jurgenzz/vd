const Sandbox = require('sandbox');

const jsExec = (message, event) => {
  const s = new Sandbox();
  let cmd = message.replace(/^js>/, '');

  s.run(cmd, output => {
    event.reply(JSON.stringify(output.result).replace(/\\n/g, ''));
  });
};

module.exports = { jsExec };
