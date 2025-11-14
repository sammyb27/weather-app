// DOM ELEMENT REFERENCES
let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  locationBtn = document.getElementById("locationBtn"),
  backend_url = typeof BACKEND_BASE_URL !== "undefined" ? BACKEND_BASE_URL : "",
  currentWeatherCard = document.querySelector(".weather-left .card"),
  fiveDaysForecastCard = document.querySelector(".day-forecast"),
  aqiCard = document.querySelectorAll(".highlights .card")[0],
  sunriseCard = document.querySelectorAll(".highlights .card")[1],
  humidityVal = document.getElementById("humidityVal"),
  pressureVal = document.getElementById("pressureVal"),
  visibilityVal = document.getElementById("visibilityVal"),
  windSpeedVal = document.getElementById("windSpeedVal"),
  feelsVal = document.getElementById("feelsVal"),
  hourlyForecastCard = document.querySelector(".hourly-forecast"),
  aqiList = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];


// Warn if backend URL is missing (in case config.js wasn’t loaded)
if (!backend_url) {
  console.warn("Warning: BACKEND_BASE_URL is not defined. Add it to js/config.js or use the deployed Render URL.");
}

// MAIN WEATHER FORECAST
function getWeatherDetails(name, lat, lon, country, state) {
  // API calls now target the backend proxy with lat/lon parameters
  let FORECAST_API_URL = `${backend_url}/api/weather?lat=${lat}&lon=${lon}&type=forecast`,
    WEATHER_API_URL = `${backend_url}/api/weather?lat=${lat}&lon=${lon}&type=current`,
    AIR_POLLUTION_API_URL = `${backend_url}/api/weather?lat=${lat}&lon=${lon}&type=pollution`;

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];


  // Today's Highlights - Air Quality Index (AQI)
  fetch(AIR_POLLUTION_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Check for API errors returned by the proxy
      if (data.message) {
        console.error("AQI Data Error:", data.message);
        aqiCard.innerHTML = `<p class="error-msg">AQI Data Unavailable</p>`;
        return;
      }

      let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
      let aqiIndex = data.list[0].main && data.list[0].main.aqi ? data.list[0].main.aqi : 1;
      aqiCard.innerHTML = `
            <div class="card">
              <div class="card-head">
                <p>Air Quality Index</p>
                <p class="air-index aqi-${aqiIndex}">
                  ${aqiList[aqiIndex - 1] || "N/A"}
                </p>
              </div>
              <div class="air-indices">
                <i class="fa-regular fa-wind fa-3x"></i>

                <div class="item">
                  <p>PM<sub>2.5</sub></p>
                  <h2>${pm2_5}</h2>
                </div>

                <div class="item">
                  <p>PM<sub>10</sub></p>
                  <h2>${pm10}</h2>
                </div>

                <div class="item">
                  <p>SO<sub>2</sub></p>
                  <h2>${so2}</h2>
                </div>

                <div class="item">
                  <p>CO</p>
                  <h2>${co}</h2>
                </div>

                <div class="item">
                  <p>NO</p>
                  <h2>${no}</h2>
                </div>

                <div class="item">
                  <p>NO<sub>2</sub></p>
                  <h2>${no2}</h2>
                </div>

                <div class="item">
                  <p>NH<sub>3</sub></p>
                  <h2>${nh3}</h2>
                </div>

                <div class="item">
                  <p>O<sub>3</sub></p>
                  <h2>${o3}</h2>
                </div>
              </div>
            </div>
          `;
    })
    .catch(() => {
      console.warn("Failed to fetch Air Quality Index from proxy");
      aqiCard.innerHTML = `<p class="error-msg">AQI Fetch Failed</p>`;
    });


  // Weather Data - Current Weather Display Details, Calendar / Location Icons & Details; Weather Icon

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Check for API errors returned by the proxy
      if (data.message) {
        console.error("Current Weather Data Error:", data.message);
        alert(`Failed to fetch current weather: ${data.message}`);
        return;
      }

      let date = new Date();
      const tempC = data.main ? (data.main.temp - 273.15).toFixed(1) : "N/A";

      currentWeatherCard.innerHTML = `
            <div class="current-weather">
              <div class="details"></div>
              <p>Now</p>
              <h2>${tempC}&deg;C</h2>
              <p>${data.weather && data.weather[0] ? data.weather[0].description : ""}</p>
            </div>
            <div class="weather-icon">
              <img src="https://openweathermap.org/img/wn/${data.weather && data.weather[0] ? data.weather[0].icon : "04d"}@2x.png" alt="">
            </div>
            <hr>
            <div class="card-footer">
              <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
              <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
            </div>
          `;


      // Today's Highlights - sunrise/sunset - convert UTC sunrise/sunset to local time using moment.js
      let { sunrise, sunset } = data.sys || {},
        { timezone, visibility } = data || {},
        { humidity, pressure, feels_like } = data.main || {},
        { speed } = data.wind || {},
        sRiseTime = typeof moment !== "undefined" && sunrise ? moment.utc(sunrise, "X").add(timezone, "seconds").format("hh:mm A") : "--:--",
        sSetTime = typeof moment !== "undefined" && sunset ? moment.utc(sunset, "X").add(timezone, "seconds").format("hh:mm A") : "--:--";

      sunriseCard.innerHTML = `
            <div class="card-head">
              <p>Sunrise & Sunset</p>
            </div>
            <div class="sunrise-sunset">
              <div class="item">
                <div class="icon">
                  <i class="fa-light fa-sunrise fa-4x"></i>
                </div>
                <div>
                  <p>Sunrise</p>
                  <h2>${sRiseTime}</h2>
                </div>
              </div>
              <div class="item">
                <div class="icon">
                  <i class="fa-light fa-sunrise fa-4x"></i>
                </div>
                <div>
                  <p>Sunset</p>
                  <h2>${sSetTime}</h2>
                </div>
              </div>
            </div>
          `;


      // Today's Highlights  -  Humidity, Pressure, Visibility, Windspeed, Feels like
      if (humidityVal) humidityVal.innerHTML = humidity !== undefined ? `${humidity}%` : "N/A";
      if (pressureVal) pressureVal.innerHTML = pressure !== undefined ? `${pressure}hPa` : "N/A";
      if (visibilityVal) visibilityVal.innerHTML = visibility !== undefined ? `${(visibility / 1000).toFixed(1)}km` : "N/A";
      if (windSpeedVal) windSpeedVal.innerHTML = speed !== undefined ? `${speed}m/s` : "N/A";
      if (feelsVal) feelsVal.innerHTML = feels_like !== undefined ? `${(feels_like - 273.15).toFixed(2)}&deg;C` : "N/A";
    })
    .catch(() => {
      alert("Failed to fetch current weather via proxy");
    });


  // Hourly Forecast ('Today At') and 5-Day Forecast
  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Check for API errors returned by the proxy
      if (data.message) {
        console.error("Forecast Data Error:", data.message);
        return;
      }

      let hourlyForecast = data.list || [];
      hourlyForecastCard.innerHTML = "";
      for (let i = 0; i <= 7 && i < hourlyForecast.length; i++) {
        let hrForeCastDate = new Date(hourlyForecast[i].dt_txt);
        let hr = hrForeCastDate.getHours();
        let a = hr < 12 ? "AM" : "PM";
        if (hr === 0) hr = 12;
        if (hr > 12) hr -= 12;
        hourlyForecastCard.innerHTML += `
              <div class="card">
                <p>${hr} ${a}</p>
                <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="">
                <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
              </div>`;
      }

      // 5-Day Forecast
      let uniqueForecastDays = [];
      let fiveDaysForecast = (data.list || []).filter((forecast) => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      fiveDaysForecastCard.innerHTML = "";
      // Start from index 1 to skip the current day (which is usually the first unique entry)
      for (let i = 1; i < fiveDaysForecast.length; i++) {
        let date = new Date(fiveDaysForecast[i].dt_txt);
        const tempC = (fiveDaysForecast[i].main.temp - 273.15).toFixed(1);

        fiveDaysForecastCard.innerHTML += `
                <div class="forecast-item">
                  <div class="icon-wrapper">
                    <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                    <span>${tempC}&deg;C</span>
                  </div>
                  <p>${days[date.getDay()]}, ${months[date.getMonth()]}</p>
                  <p>${fiveDaysForecast[i].weather[0].description}</p>
                </div>
              `;
      }
    })
    .catch(() => {
      console.warn("Failed to fetch forecast from proxy");
    });
}


// Enter City Name
function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;

  let GEOCODING_API_URL = `${backend_url}/api/geocode?city=${encodeURIComponent(cityName)}`;
  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      // Check for API errors returned by the proxy
      if (data.message) {
        alert(`API Error: ${data.message}`);
        return;
      }
      if (!data || !data[0]) {
        alert(`No coordinates found for ${cityName}`);
        return;
      }
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() => alert(`Failed to fetch coordinates of ${cityName} via proxy`));
}


// Current Location
function getUserCoordinates() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      let { latitude, longitude } = position.coords;
      let REVERSE_GEOCODING_URL = `${backend_url}/api/reverse-geocode?lat=${latitude}&lon=${longitude}`;

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          // Check for API errors returned by the proxy
          if (data.message) {
            alert(`API Error: ${data.message}`);
            return;
          }
          if (!data || !data[0]) {
            alert("Failed to reverse geocode your location");
            return;
          }
          let { name, country, state } = data[0];
          getWeatherDetails(name, latitude, longitude, country, state);
        })
        .catch(() => {
          alert("Failed to fetch user coordinates via proxy");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation permission denied. Please enable location access.");
      } else {
        alert("Unable to retrieve your location.");
      }
    }
  );
}

searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && getCityCoordinates());
window.addEventListener("load", getUserCoordinates);