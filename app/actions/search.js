const search = (message, event) => {
  let query = '';

  let msg = message.replace(/!search /, ''); // remove command itself

  let queries = msg.match(/(\w+:\w+)/g);

  if (queries && queries.length) {
    queries.forEach(q => {
      const [k, , v] = q.split(':');
      if (!v) {
        return;
      }
      query += `&${k}=${encodeURIComponent(v)}`;
    });
  }

  event.reply('https://developers.lv/?search' + query);
};

module.exports = {
  search
};
