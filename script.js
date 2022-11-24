let weatherApiRootUrl = 'https://api.openweathermap.org';
let weatherApiKey = 'd91f911bcf2c0f925fb6535547a5ddc9';  


let searchBtn = document.getElementById("search-button")
let input = document.getElementById("search-input")
let history = document.getElementById("history")
let searchForm = document.querySelector('#search-form');
let todayContainer = document.querySelector('#today');
let forecastContainer = document.querySelector('#forecast');


dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// click search ntn
// input value = list item name
// store value to array
// use that array to create ele btn
// list will appear 
let cities = JSON.parse(localStorage.getItem('cities')) || [];
let city = "";
searchBtn.addEventListener("click" ,function(event){
  event.preventDefault();
  city = input.value;
  fetchCity(city);
  appendToHistory(city);
  renderHistoryList();
});

function renderHistoryList(){
  history.textContent = "";
  for(let i = cities.length -1 ; i>=0 ; i--){
    let listHistory = document.createElement("button")
    listHistory.setAttribute("type","button")
    listHistory.setAttribute('aria-controls', 'today forecast')
    listHistory.classList.add('history-btn', 'btn-history')
    listHistory.setAttribute('data-search', cities[i]);
    listHistory.textContent = cities[i];
    history.appendChild(listHistory); 
  }
  
}


function appendToHistory(city) {
  if (cities.indexOf(city) !== -1) {
    return;
  }
  cities.push(city);

  localStorage.setItem('cities',JSON.stringify(cities));
  renderHistoryList();
}


function renderCurrentWeather(city, weather) {
  let date = dayjs().format('M/D/YYYY');
  let tempF = weather.main.temp;
  let windMph = weather.wind.speed;
  let humidity = weather.main.humidity;
  let iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  let iconDescription = weather.weather[0].description || weather[0].main;

  let card = document.createElement('div');
  let cardBody = document.createElement('div');
  let heading = document.createElement('h2');
  let weatherIcon = document.createElement('img');
  let tempEl = document.createElement('p');
  let windEl = document.createElement('p');
  let humidityEl = document.createElement('p');

  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');
  card.append(cardBody);

  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.textContent = '';
  todayContainer.append(card);
}


function renderForecastCard(forecast) {

  let iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  let iconDescription = forecast.weather[0].description;
  let tempF = forecast.main.temp;
  let humidity = forecast.main.humidity;
  let windMph = forecast.wind.speed;

  
  let col = document.createElement('div');
  let card = document.createElement('div');
  let cardBody = document.createElement('div');
  let cardTitle = document.createElement('h5');
  let weatherIcon = document.createElement('img');
  let tempEl = document.createElement('p');
  let windEl = document.createElement('p');
  let humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

 
  cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
}


function renderForecast(dailyForecast) {
  let startDt = dayjs().add(1, 'day').startOf('day').unix();
  let endDt = dayjs().add(6, 'day').startOf('day').unix();

  let headingCol = document.createElement('div');
  let heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}


// click city button
// get api 
// render on page city/Temp/Wind/Humidity
// localstoarge setitem - get item
function fetchCity(city) {

  let url = `${weatherApiRootUrl}/geo/1.0/direct?q=${city}&limit=5&appid=${weatherApiKey}`

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data)
      if(!data[0]){
        alert('Please enter a valid city name')
      }else {
        fetchWeather(data[0]);
        appendToHistory(city);
       }
    })
}



function fetchWeather(location) {
  let { lat } = location;
  let { lon } = location;
  let city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      console.log(data)
      renderItems(city, data);
    })
}

function historyClick(event) {
  // // Don't do search if current elements is not a search history button
  if (!event.target.matches('.btn-history')) {
    return;
  }

  let btn = event.target;
  let city =  btn.setAttribute('data-search')
  fetchCity(city);
}


history.addEventListener('click', historyClick);