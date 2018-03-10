const axios = require('axios');
const {APP_CONFIG} = require('../../config')

let weatherInProgress = false;

const clearWeather = () => {
  setTimeout(() => {
    weatherInProgress = false;
  }, 5000);
};

const weatherCheck = (message, event) => {
  let msgArr = message.split(' ');
  let city = msgArr[1];

  if (city && !weatherInProgress) {
    weatherInProgress = true;

    axios
      .get(
        `http://api.openweathermap.org/data/2.5/find?q=${city}&units=metric&appid=${
          APP_CONFIG.weatherAPI
        }`
      )
      .then(res => {
        if (res && res.data && res.data.list && res.data.list.length) {
          let weatherInfo = res.data.list[0];
          let weatherDescription = res.data.list[0].weather[0];
          let reply = `Weather in ${city}: ${
            weatherDescription.description
          }, Temperature: ${weatherInfo.main.temp}℃ , wind: ${
            weatherInfo.wind.speed
          } m/s.`;
          event.reply(reply);
        }
        weatherInProgress = false;
      })
      .catch(err => {
        clearWeather();
      });
  }
};

module.exports = {
  weatherCheck
}