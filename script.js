const api_key = '135e4e85fa764a3cc8a7447dee48aa09';
var cityList =[];
// Geolocation api 
//http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}

$("submit-btn").on("click", function(event){
    event.preventDefault();
    var city;
    city = $("#city-input").val().trim();
    if(city === ""){
        alert("Please enter a city")

    }else if (cityList.length >= 5){  
        cityList.shift();
        cityList.push(city);

    }else{
        cityList.push(city);
    }
    //storeCurrentCity(city);
    //storeCityArray();
    //renderCities();
    //getLocation(city);
        
});