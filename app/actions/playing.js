const fs = require('fs');
const axios = require('axios');


let config = {};
//let users = {};

try {
  config = require('../../../vdk-ui/config.json');
} catch (err) {
  //
}

const playing = (message, event) => {

  let users = {};
  message = message.replace(/^!playing ?/, '');
  let nick = message || event.nick;
  try {
    users = require('./../../../tokens.json');
  } catch (err) {
    // err
   
    // users = {};
  }
  if (!users[nick]) {
    return;
  }
  let { access_token, refresh_token } = users[nick];

  if (!access_token || !refresh_token) {
    return;
  }
  const getLastSong = token => {
    if (!token) {
      return;
    }
    axios
      .get('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      })
      .then(res => {
        if (res && res.data && res.data.is_playing) {
          event.reply(res.data.item.artists.map(a => a.name).join(', ') + ' — ' + res.data.item.name);
        }
      })
      .catch(err => {
        // handle expired token
        axios({
          url: 'https://accounts.spotify.com/api/token',
          method: 'post',
          params: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token,
            client_id: config.client_id,
            client_secret: config.client_secret
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then(res => {
            users[nick] = users[nick] || {};
            users[nick]["access_token"] = res.data.access_token;
            
            fs.writeFile('./../../../tokens.json', JSON.stringify(users), err => {
              getLastSong(res.data.access_token);
            });
          })
          .catch(err => {
            //
          });
      });
  };

  getLastSong(access_token);
};

module.exports = {
  playing
};
