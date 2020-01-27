// global variable declarations
var apiKey =  "afbb9261d5cc0d768b7aa8fe78069293";   // my AIP key
var inputCity;  // variable to contain the search city name
var queryURL;   // variable to contain the AIP call url for a city weather

// get the data from localStorage and assign it to the variable cityHistory
var cityHistory = JSON.parse(localStorage.getItem("weatherCity"));

$(document).ready(function() {
    if(cityHistory) {   // if search history exist (in localStorage)
        createSearchHistoryTbl(0);  // display the search history table
    } else {
        cityHistory = [];
    }

    // search button event handler
    $("#searchBtn").on("click", function(event) {
        event.preventDefault();  
        // get the user input city and assign the value to the variable inputCity
        inputCity = $("#cityInput").val().trim();
        // display the searched city weather
        createCityWeather();
    });

    // city search history table data event handler
    $("td").on("click", function(event) {
        event.preventDefault();
        // get the city that the user choose to search from the search history
        inputCity = $(this)[0].textContent;
        // display the searched city weather
        createCityWeather();
    });

    // function to make weather AIP call and display the sarch input city weather
    function createCityWeather() {
       // assign the API call url for the current weather to the variable queryURL
       queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + inputCity + "&appid=" + apiKey;
       // variable to contain error message in case the input is a invalid city name
       var errorMsg;
       
       $.ajax({
           url: queryURL,
           method: "GET", 
           error: function(msg) {  // if invalid city name is entered (error 400 or 404 returned)
               var errorMsg = msg.responseJSON.message;
               $("#errorMsg").text(errorMsg);
               resetDisplay();
           }
       }).then(function(response) {
           // get display ready for the results 
           getDisplayReady();

           // set city name to the "city" division text
           var cityName = response.name;
           $("#city").text(cityName);

           // set today's date to the "date" division text
           var today = moment().format('l');
           $("#date").text(today);

           // set icon url to the img's "src" attribute
           var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
           $("#img").attr("src", iconURL);

           // set temperature in fahrenheit to the "temp" division html
           var tempinF = ((response.main.temp - 273.15) * 9/5 + 32).toFixed(2);
           $("#temp").html("Temperature: " + tempinF + "&#8457;");

           // set humidity to the "humidity" division text
           var humid = response.main.humidity;
           $("#humidity").text("Humidity: " + humid + "%");

           // set wind speed to the "wind" division text
           var windSpeed = response.wind.speed;
           $("#wind").text("Wind Speed: " + windSpeed + "MPH");

           // create uv division
           createUVDiv(response.coord.lat, response.coord.lon);

           // create 5-day forecast
           createFiveDayForecast(response.id);             

           // store the city name in localStorage
           storeCity(cityName);
       });
    }

    // function to create the UV index division
    function createUVDiv(lat, lon) {
        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon;

        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function(response) {
            // get the uv index value and set it as the uv division's text
            var uvIndex = response.value;
            $("#uv").text("UV Index: " + uvIndex);
        });
    }

    // function to create 5-day forecast
    function createFiveDayForecast(id) {
        var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + id + "&appid=" + apiKey;
        
        $.ajax({
            url: fiveDayURL,
            method: "GET"
        }).then(function(response) {
            // index of the data of 3pm on each day
            var dataIndex = [3, 11, 19, 27, 35];

            // create forecast division for each day's forecast
            dataIndex.forEach(function(num) {
                // get the day's data
                var currentData = response.list[num];
                // get date and format
                var date = moment(currentData.dt_txt).format('MM/DD/YYYY');
    
                // get the weather icon url and set it to the image's src attribute
                var iconURL = "https://openweathermap.org/img/wn/" + currentData.weather[0].icon + ".png";
                var weatherImg = $("<img>").attr("src", iconURL).css("clear", "both");

                // get the day's temperature and set it to the division's html
                var tempinF = "Temp: " + fromKelvinToFahrenheit(currentData.main.temp) + "&#8457;";
                var temp = $("<div>").css("clear", "both").html(tempinF);

                // get the day's humidity and assign it to the variable humidity
                var humidity = "Humidity: " + currentData.main.humidity + "%";

                // create the day's forcast division and append all the data to it
                var dayForecast = $("<div>").addClass("col-xs-12 col-sm-12 col-md-3 col-lg-2 mx-1 my-1 p-0 rounded").css("background-color", "#0868f8");
                dayForecast.addClass("text-center").append(date, weatherImg, temp, humidity);

                // append the day's forcast to the division fiveDayForecast
                $("#fiveDayForecast").append(dayForecast);
            });
        });
    }

    // function to create the city search history table
    function createSearchHistoryTbl(startRow) {
        // start adding row/rows from the property "startRow"th row of the table cityHistory
        for(var i = startRow; i < cityHistory.length; i++) {
            var newCity = $("<td>").text(cityHistory[i]);
            var newRow = $("<tr>").append(newCity);
            $("#cityHistory").append(newRow);
        }
    }

    // function to convert temperature from Kelvin to Fahrenheit
    function fromKelvinToFahrenheit(kel) {
        return ((kel - 273.15) * 9/5 + 32).toFixed(2);
    }

    // function to enable the currentWeather division and clear the previously 5-day forecast displayed
    function getDisplayReady() {
        $("#currentWeather").css("display", "block");
        $("#fiveDayForecast").empty();
        $("#errorMsg").text("");
    }

    // function to reset display to the initial setting
    function resetDisplay() {
        $("#currentWeather").css("display", "none");
        $("#fiveDayForecast").empty();
    }

    // function to store the input city into localStorage
    function storeCity(city) {
        if(!cityHistory.includes(city)) {   // if the saerched city does not exist in search history
            cityHistory.push(city);
            // add the new searched city into localStorage
            localStorage.setItem("weatherCity", JSON.stringify(cityHistory));
            var numRows = $("#cityHistory")[0].rows.length;
            // add the new searched city into the search history table displayd below search input
            createSearchHistoryTbl(numRows);          
        }
    }
});