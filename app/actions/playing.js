const fs = require('fs');
const axios = require('axios');

const playing = (message, event) => {
  try {
    users = require('./../../../tokens.json');
  } catch (err) {
    // err
    reminders = {};
  }
  let { access_token, refresh_token } = users[event.nick];

  const getLastSong = token => {
    axios
      .get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then(res => {
        if (res && res.data && res.data.is_playing) {
          event.reply(res.data.item.name + ' - ' + res.data.item.artists.map(a => a.name).join(', ') + '.');
        }
      })
      .catch(err => {
        // handle expired token
        axios({
          url: 'https://accounts.spotify.com/api/token',
          method: 'post',
          params: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }).then(res => {
          users[user] = {
            access_token: res.data.access_token,
          };
          fs.writeFile("./../../../tokens.json", JSON.stringify(users), err => {
            getLastSong(res.data.access_token)
          })

        })
      });
  };

  getLastSong(access_token)
};

module.exports = {
  playing
};
