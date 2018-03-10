const axios = require('axios');
const cheerio = require('cheerio');

let requestInProgress = false;

const allowNextRequest = () => {
  setTimeout(() => {
    requestInProgress = false;
  }, 5000);
};

const count = (message, event) => {
  let query = message.replace(/!count /, '');
  let url = 'http://www.pmlp.gov.lv/lv/sakums/statistika/personvardu-datu-baze/?id=137&query=';

  if (requestInProgress) {
    return;
  }

  requestInProgress = true;

  axios
    .get(url + encodeURIComponent(query))
    .then(res => {
      const $ = cheerio.load(res.data);

      // :(
      let count = $('#firstnames-search-results tbody > tr:nth-of-type(1) > td:nth-of-type(2)').text();

      if (count) {
        let human = 'cilvēki';
        let registered = 'reģistrēti';

        if (count === '1') {
          human = 'cilvēks';
          registered = 'reģistrēts';
        }
        event.reply(`PMLP izskaitīja, ka Latvijā ir ${registered} ${count} ${human} ar vārdu ${query}`);
      } else {
        event.reply(`PMLP saka, ka nav ar šādu vārdu neviens.`);
      }
      requestInProgress = false;
    })
    .catch(err => {
      allowNextRequest();
    });
};

module.exports = {
  count
};
