// assign the API Key to the variable apiKey
var apiKey =  "afbb9261d5cc0d768b7aa8fe78069293"; 

$(document).ready(function() {
    $("#searchBtn").on("click", function(event) {
        event.preventDefault();
        clearDisplay(); // clear the previously displayed data
       
        // get the user input city and assign the value to the variable inputCity
        var inputCity = $("#cityInput").val().trim();
        // assign the API call url for the current weather to the variable queryURL
        var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + inputCity + "&appid=" + apiKey;
        console.log("queryURL: " + queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            // create city name division
            var cityName = response.name;
            var city = $("<div>").addClass("my-4 p-2 float-left").css("font-size", "1.5em").text(cityName);
            // create date divison
            var today = moment().format('l');
            var date = $("<div>").addClass("my-4 p-2 float-left").css("font-size", "1.5em").text(today);   
            // create weather icon division
            var iconURL = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
            var weatherImg = $("<img>").addClass("float-left").attr("src", iconURL);          
            // create temperature division
            var tempinF = fromKelvinToFahrenheit(response.main.temp);
            var temp = $("<div>").addClass("p-2").css("clear", "both").html("Temperature: " + tempinF + "&#8457;");
            // create humidity division
            var humid = response.main.humidity;
            var humidity = $("<div>").addClass("p-2").css("clear", "both").text("Humidity: " + humid + "%");
            // create wind division
            var windSpeed = response.wind.speed;
            var wind = $("<div>").addClass("p-2").css("clear", "both").text("Wind Speed: " + windSpeed + "MPH");
 
            $("#currentWeather").addClass("border").append(city, date, weatherImg, temp, humidity, wind);

            // create uv division
            createUVDiv(response.coord.lat, response.coord.lon);

            // create 5-day forecast
            createFiveDayForecast(response.id);          

            // doesn't work...
            // // set city name to the "city" division text
            // var cityName = response.name;
            // $("#city").text(cityName);
            // // set today's date to the "date" division text
            // var today = moment().format('l');
            // $("#date").text(today);
            // // set icon url to the img's "src" attribute
            // var iconURL = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
            // $("#img").attr("src", iconURL);
            // // set temperature in fahrenheit to the "temp" division html
            // var tempinF = ((response.main.temp - 273.15) * 9/5 + 32).toFixed(2);
            // $("#temp").html("Temperature: " + tempinF + "&#8457;");
            // // set humidity to the "humidity" division text
            // var humid = response.main.humidity;
            // $("#humidity").text("Humidity: " + humid + "%");
            // // set wind speed to the "wind" division text
            // var windSpeed = response.wind.speed;
            // $("#wind").text("Wind Speed: " + windSpeed + "MPH");
        });
    });

    function createUVDiv(lat, lon) {
        var uvURL = "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon;

        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function(response) {
            var uvIndex = response.value;
            var uv = $("<div>").addClass("p-2").css("clear", "both").text("UV Index: " + uvIndex);
            $("#currentWeather").append(uv);
        });
    }

    function createFiveDayForecast(id) {
        var fiveDayURL = "http://api.openweathermap.org/data/2.5/forecast?id=" + id + "&appid=" + apiKey;
        console.log(fiveDayURL);
        $.ajax({
            url: fiveDayURL,
            method: "GET"
        }).then(function(response) {
            // index of the data of 3pm on each day
            var dataIndex = [3, 11, 19, 27, 35];
            dataIndex.forEach(function(num) {
                var currentData = response.list[num];
                // get date and format
                var date = moment(currentData.dt_txt).format('MM/DD/YYYY');
                var iconURL = "http://openweathermap.org/img/wn/" + currentData.weather[0].icon + ".png";
                var weatherImg = $("<img>").attr("src", iconURL).css("clear", "both");
                var tempinF = "Temp: " + fromKelvinToFahrenheit(currentData.main.temp) + "&#8457;";
                var temp = $("<div>").css("clear", "both").html(tempinF);
                var humidity = "Humidity: " + currentData.main.humidity + "%";
                // each day's forcast division
                var dayForecast = $("<div>").addClass("col-xs-12 col-sm-12 col-md-3 col-lg-2 mx-auto my-1 p-0 rounded").css("background-color", "blue");
                dayForecast.addClass("text-center").append(date, weatherImg, temp, humidity);
                // append each day's forcast to the division fiveDayForecast
                $("#fiveDayForecast").append(dayForecast);
            });
        });
    }

    // function to convert temperature from Kelvin to Fahrenheit
    function fromKelvinToFahrenheit(kel) {
        return ((kel - 273.15) * 9/5 + 32).toFixed(2);
    }

    function clearDisplay() {
        $("#currentWeather").empty();
    }
});