const api_key = '135e4e85fa764a3cc8a7447dee48aa09';
const currentWeatherEl = $('.todaysConditions');
const forecastContainterEl = $('#forecast-container');
const cityListContainerEl = $('#search-history');
const errorMsgEl = $('#error-msg');
let weatherConditions = {
    date: "",
    temp: "",
    wind_speed: "",
    humidity: "",
    icon: ""
}
let cityList = [];

initCityList();

//Click Search
$("#submit-btn").on("click", function (event) {
    event.preventDefault();
    forecastContainterEl.empty();
    currentWeatherEl.empty();
    var city = $("#city-input").val().trim();
    if (city === "") {
        errorMsgEl.text("Please enter a city");
        return;
    } 
    getWeather(city);
    renderCityList();
});

// Enter key executes the search
$("#city-input").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#submit-btn").click();
    }
});

//Clicking on a button executes the search
$(document).on("click", ".button", function historyDisplayCities(){
    searchedCity = $(this).attr("data-name");
    forecastContainterEl.empty();
    currentWeatherEl.empty();
    getWeather(searchedCity);
    renderCityList();
});

//Clean error message 
$(document).on("click", "#city-input", function cleanError(){
    errorMsgEl.empty();
    $("#city-input").val('');
});

function getWeather(city) {
    let url = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + "&appid=" + api_key;

    fetch(url)
        .then(function (response) {
            return (response.json());
        }).then(function (data) {
            if(data.length === 0){
                errorMsgEl.text("City not found");
                return;     
            }

            $("#city-input").empty();

            let { lat, lon } = data[0];
            let city = data[0].name;
            let state = abbreviateState(data[0].state);
            let country = data[0].country;

            storeCity(city);
            
            url = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + api_key;
            fetch(url)
                .then(function (response) {
                    return (response.json());
                }).then(function (data) {
                    
                    (country === "US") ? cityName = city+", "+state : cityName = city+", "+country;

                    weatherConditions.date = '<b>Today</b><br>' + dayjs((data.list[0].dt_txt).substring(0,10)).format('dddd MMM DD');
                    weatherConditions.temp = parseFloat(((data.list[0].main.temp-273.15)*1.8)+32).toFixed(1)+'\u2109'
                    weatherConditions.humidity = data.list[0].main.humidity+'%';
                    weatherConditions.wind_speed = data.list[0].wind.speed+' MPH';
                    weatherConditions.icon = 'https://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png';

                    const currentWeatherHtml = createTodaysConditionsEl(cityName, weatherConditions);
                    currentWeatherEl.append(currentWeatherHtml);

                    let index = 4;                    
                    for(let i=0; i<5; i++){                        
                        let weekDay = dayjs((data.list[index].dt_txt).substring(0,10)).format('dddd');
                        weatherConditions.date = '<b>' + weekDay + '</b><br>' + dayjs((data.list[index].dt_txt).substring(0,10)).format('MMM DD');
                        weatherConditions.temp = parseFloat(((data.list[index].main.temp-273.15)*1.8)+32).toFixed(1)+'\u2109';
                        weatherConditions.humidity = data.list[index].main.humidity+'%';
                        weatherConditions.wind_speed = data.list[index].wind.speed+ ' MPH';
                        weatherConditions.icon = 'https://openweathermap.org/img/w/' + data.list[index].weather[0].icon + '.png';

                        const forecastHtml = createDateForecastEl(weatherConditions);
                        forecastContainterEl.append(forecastHtml);
                        index = index + 8;
                    }
                    renderCityList();
                });0
        });
}

// Saves the city array to local storage
function storeCity(city) {
    if (localStorage.getItem('cities')===null){
        cityList.push(city);
    }
    else {
        const citiesLocalStorage = localStorage.getItem('cities') || [];
        let citiesLocalStorageItems = JSON.parse(citiesLocalStorage);
        
        if (!citiesLocalStorageItems.find(function checkCity(myCity){
            return myCity === city;
            })){
                if (cityList.length >= 5) {
                    cityList.shift();
                    cityList.push(city);            
                } 
                    else {
                            cityList.push(city);
                    }
                }
    }
    localStorage.setItem('cities', JSON.stringify(cityList));
}

function initCityList() {
    
    if (localStorage.getItem('cities')){
        cityList = JSON.parse(localStorage.getItem('cities'));
    }

    renderCityList();
}

function renderCityList(){
    cityListContainerEl.empty();
    cityList.sort(function (a, b){
        if(a<b){
            return 1;
        }
        if(a>b){
            return -1;
        }
        return 0;
    });
    for (i=0; i<cityList.length; i++){
        var a = $('<a>');
        a.addClass('button px-4 m-4 button-wrap');
        a.attr('data-name', cityList[i]);
        a.text(cityList[i]);
        cityListContainerEl.prepend(a);
    } 
}

function createTodaysConditionsEl(cityName, weatherConditions){
    const {date,temp,humidity,wind_speed,icon} = weatherConditions;
    return(`
    <div id="current-weather" class="tile is-7 box">
        <h2 id="city-name" class="title">${cityName}</h2>
        <p id="date" class="subtitle">${date}</p>
        <p id="weather-icon" class="content">
        <div id="icon"><img id="wicon" src="${icon}" alt="Weather icon"></div>
        </p>
        <p id="main-temperature" class="content">Temperature: ${temp}</p>
        <p id="main-wind-speed" class="content">Wind speed: ${wind_speed}</p>
        <p id="main-humidity" class="content">Humidity: ${humidity}</p>
    </div>`);
}

function createDateForecastEl(weatherConditions){
    const {date,temp,humidity,wind_speed,icon} = weatherConditions;
    return (
    `<div class="tile is-parent">
    <article class="tile is-child box">
        <p class="subtitle">${date}</p>
        <p id="weather-icon" class="content">
            <div id="icon"><img id="wicon" src="${icon}" alt="Weather icon"></div>
        </p>    
        <p class="content">Temperature: ${temp}</p>
        <p class="content">Wind speed: ${wind_speed}</p>
        <p class="content">Humidity: ${humidity}</p>
    </article>
    </div>`);
}

function abbreviateState(state){

    const stateMap = {
        "Alabama": "AL",
        "Alaska": "AK",
        "Arizona": "AZ",
        "Arkansas": "AR",
        "American Samoa": "AS",
        "California": "CA",
        "Colorado": "CO",
        "Connecticut": "CT",
        "Delaware": "DE",
        "District of Columbia": "DC",
        "Florida": "FL",
        "Georgia": "GA",
        "Guam": "GU",
        "Hawaii": "HI",
        "Idaho": "ID",
        "Illinois": "IL",
        "Indiana": "IN",
        "Iowa": "IA",
        "Kansas": "KS",
        "Kentucky": "KY",
        "Louisiana": "LA",
        "Maine": "ME",
        "Maryland": "MD",
        "Massachusetts": "MA",
        "Michigan": "MI",
        "Minnesota": "MN",
        "Mississippi": "MS",
        "Missouri": "MO",
        "Montana": "MT",
        "Nebraska": "NE",
        "Nevada": "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        "Northern Mariana Islands": "MP",
        "Ohio": "OH",
        "Oklahoma": "OK",
        "Oregon": "OR",
        "Pennsylvania": "PA",
        "Puerto Rico": "PR",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        "Tennessee": "TN",
        "Texas": "TX",
        "Trust Territories": "TT",
        "Utah": "UT",
        "Vermont": "VT",
        "Virginia": "VA",
        "Virgin Islands": "VI",
        "Washington": "WA",
        "West Virginia": "WV",
        "Wisconsin": "WI",
        "Wyoming": "WY",
    }

    if (!stateMap[state]){
        return;
    }
    return (stateMap[state]);

}