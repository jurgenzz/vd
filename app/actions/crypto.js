const axios = require('axios');

const crypto = (message, event, coinbase) => {
  message = message.replace(/^!crypto |^!coinbase /, '');
  let currencies = message.split('/');
  let from = currencies[0];
  let to = currencies[1];

  if (from && to) {
    from = from.toUpperCase();
    to = to.toUpperCase();
    // event.reply(currencies[0] + ' ' +  currencies[1] + `${coinbase}`);
    //         https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR&e=Coinbase
    let url = `https://min-api.cryptocompare.com/data/price?fsym=${from}&tsyms=${to}`;
    if (coinbase) {
      url += '&e=Coinbase';
    }
    axios.get(url).then(res => {
      if (res && res.data) {
        if (res.data.Response !== 'Error') {
          let reply = Object.keys(res.data)
            .map(key => `${from}/${key}: ${res.data[key]}`)
            .join(', ');
          event.reply(reply);
        } else if (res.data.Response === 'Error' && res.data.Message) {
          event.reply(res.data.Message);
        }
      }
    });
  }
};

module.exports = {
  crypto
};
