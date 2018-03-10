const search = (message, event) => {
  let query = '';

  let msg = message.replace(/!search /, ''); // remove command itself

  let queries = msg.match(/(\w+:\w+)/g);

  if (queries && queries.length) {
    queries.map(q => {
      query += '&';
      query += q.split(':').join('=');
      msg = msg.replace(q, '');
    });
  }

  event.reply('https://developers.lv/?search&text=' + encodeURIComponent(msg) + query);
};

module.exports = {
  search
};
