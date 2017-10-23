const _ = require('lodash');
const moment = require('moment');
const axios = require('axios');
const config = require('./config');
const {
  humanizeDelta,
  storeDate,
  hypheniphyDate,
  DURATION_MAPPING
} = require('./helpers');
const { vdCheckUp } = require('./vdCheckUp');
let Storage = require('node-storage');

let weatherInProgress = false;
let usersVoted = [];

const UNDERLINE_CHAR = '\u001f'


const clearWeather = () => {
  setTimeout(() => {
    weatherInProgress = false;
  }, 5000);
};

const commands = [
  {
    regex: /:\)\)\)\)\)/,
    action: event => event.reply(')))))')
  },
  {
    regex: '!vd',
    action: event => vdCheckUp(event, 'reply')
  },
  {
    regex: '!weather',
    action: event => {
      let msgArr = event.message.split(' ');
      let city = msgArr[1];

      if (city && !weatherInProgress) {
        weatherInProgress = true;

        axios
          .get(
          `http://api.openweathermap.org/data/2.5/find?q=${city}&units=metric&appid=${config.weatherAPI}`
          )
          .then(res => {
            if (res && res.data && res.data.list && res.data.list.length) {
              let weatherInfo = res.data.list[0];
              let weatherDescription = res.data.list[0].weather[0];
              let reply = `Weather in ${city}: ${weatherDescription.description}, Temperature: ${weatherInfo
                .main.temp}°C, wind: ${weatherInfo.wind.speed} m/s.`;
              event.reply(reply);
              }  
	    clearWeather();
            
          })
          .catch(err => {
            clearWeather();
          });
      }
    }
  },
  {
    regex: '/voteban',
    action: (event, { client, currentChannels }) => {
      if (event.nick.match(/zn|msks|vdk|cbot_git|Xn|agni/)) {
        return;
      }

      let voteDB = new Storage('../voteDB');
      let nicks = voteDB.get('nicks');
      nicks = nicks ? JSON.parse(nicks) : {};

      let msgArr = event.message.split(' ');
      let nick;
      // get nick from cmd
      if (msgArr.length) {
        if (msgArr.length === 2) {
          nick = msgArr[1];
        } else {
	  if (!event.nick.match(/daGrevis|ij|jurgenzz/)) {
	 	return;
	  }
          // TODO: wrap in a function
          let voteArr = Object.keys(nicks).map(nick => {
            return { nick: nick, value: nicks[nick] };
          });
          voteArr = _.sortBy(voteArr, arr => arr.value).reverse().slice(0, 5);

          let msgToReply = 'Top-hated nicks: ';

          voteArr.map(vote => {
            msgToReply = msgToReply + vote.nick.replace(/./, char => UNDERLINE_CHAR + char + UNDERLINE_CHAR) + ` [${vote.value}], `;
          });
          event.reply(msgToReply.replace(/,\s$/g, ''));       
          return;
        }
      }

      let currentUserHasVoted = false;
      usersVoted.map(user => {
        if (user.nick === event.nick) {
          currentUserHasVoted = user;
        }
      })

      const chan = currentChannels[event.target];
      // no spamming pm
      if (!chan) {
       // client.say(event.nick, `Tev nebūs balsot citiem nezinot.`)
        return;
      }

      chan.updateUsers(ev => {
        let userIsOnline = _.find(ev.users, user => {
          if (user.nick === nick) {
            return user
          }
        })

        if (!userIsOnline) {
         // client.say(event.nick, `Balsot var tikai par online lietotājiem.`)
          return;
        }


        const THIRTY_MINUTES = 1800000;

        if (currentUserHasVoted) {
          let timeLeftInMs = (currentUserHasVoted.time) - new Date().getTime();
          let minutes = Math.floor(timeLeftInMs / 60000)
          var seconds = ((timeLeftInMs % 60000) / 1000).toFixed(0);
         // client.say(event.nick, `Varēsi balsot pēc ${minutes}:${seconds}.`)
          return;
        }

        let newUserHasVoted = { nick: event.nick, time: new Date().getTime() + THIRTY_MINUTES }
        usersVoted.push(newUserHasVoted);

        setTimeout(() => {
          usersVoted = _.pull(usersVoted, newUserHasVoted);
        }, THIRTY_MINUTES)


        if (nicks[nick]) {
          nicks[nick] = nicks[nick] + 1;
        } else {
          nicks[nick] = 1;
        }

        voteDB.put('nicks', JSON.stringify(nicks));

        // remap votearr so we can find 5 with largest votes
        let voteArr = Object.keys(nicks).map(nick => {
          return { nick: nick, value: nicks[nick] };
        });

        voteArr = _.sortBy(voteArr, arr => arr.value).reverse().slice(0, 5);

        let msgToReply = 'Top-hated nicks: ';

        voteArr.map(vote => {
          msgToReply = msgToReply + vote.nick.replace(/./, char => UNDERLINE_CHAR + char + UNDERLINE_CHAR) + ` [${vote.value}], `;
        });
       // event.reply(msgToReply.replace(/,\s$/g, ''));

      })
    }
  },
  {
    regex: '!echo',
    action: event => {
      if (event.nick.match(/zn|msks|vdk|cbot_git|Xn|agni/)) {
        return;
      }
      let reply = event.message.replace(/!echo/, '');
      event.reply(reply);
    }
  },
  {
    regex: '!ping',
    action: (event, { replyToUser }) => {
      let reply = replyToUser ? `${event.nick}, pong!` : 'pong';
      event.reply(reply);
    }
  },
  {
    regex: '!uptime',
    action: (event, { connectionTime }) => {
      const now = new Date();
      let timeUp = humanizeDelta(now - connectionTime);
      event.reply(timeUp);
    }
  },
  {
    regex: '!remind',
    action: event => {
      let msg = event.message;
      let nick = event.nick;
      let channel = event.target;
      let timeStamp = event.message.split(' ')[1]; // returns 7d4h, 7d, 1d, 2w,
      msg = msg
        .replace(/!remind/g, '')
        .replace(timeStamp, '')
        .replace(/\s+/, '');

      // days / week / hour / match
      if (!timeStamp) {
        return;
      }

      let dates = timeStamp.match(/\d+[wdhms]/g);
      let seconds = _.reduce(
        dates,
        (seconds, date) => {
          return (
            seconds +
            date.match(/\d+/)[0] * DURATION_MAPPING[date.match(/[a-z]/)]
          );
        }, 0);

      if (seconds / DURATION_MAPPING['d'] > 50) {
        event.reply(`Sorry ${nick}, memory limited to 50 days.`);
        return;
      }

      let when = new Date(moment().add(seconds, 'seconds').valueOf());
      storeDate(hypheniphyDate(when), nick, msg, channel);

      let after = _.join(humanizeDelta(seconds * 1000).split(' '), ', ');
      event.reply(`A reminder has been set. Will remind you in ${after}`);
    }
  }
];

module.exports = commands;
