var apiKey = "3577a03a7170c5a820e70caf8158ea1e";
var city = "";
var date = moment().format("MM/DD/YYYY");
var lat, long;

var previousSearches = [];

previousSearchList();
initialize();

$("input").keypress(function(event) {
    var keycode = (event.keycode ? event.keycode : event.which);

    if(keycode == '13') {
        city = $("input").attr("aria-label", "City Search").val();
        grabCity(city, true);
        $("input").attr("aria-label", "City Search").val("");
    }
});

$("#CitySearch").on("click", function(){
    city = $("input").attr("aria-label", "City Search").val();
    grabCity(city, true);
    $("input").attr("aria-label", "City Search").val("");
});

$('.list-group-item').on("click", function() {
    if($(this).text() != "-"){
        city = $(this).text();
        grabCity(city, false);
    }
});

function grabCity(city, add)
{
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {

        city = response.name;

        var img = "http://openweathermap.org/img/wn/" + response.weather[0].icon + ".png";

        lat = response.coord.lat;
        long = response.coord.lon;

        var cityDiv = $(".city").children();

        $(cityDiv[0]).html("<h2>"+ response.name + " (" + date + ")" + "<img src=" + img + "></h2>");

        $(cityDiv[1]).text("Temperature: " + KToF(response.main.temp));
        $(cityDiv[2]).text("Humidity: " + response.main.humidity);
        $(cityDiv[3]).text("Wind Speed: " + response.wind.speed);
        $(cityDiv[4]).text("UV Index: ");

        uvIndex();
        fiveDayForecast(lat, long);
        addToPrev(response.name, add);
        previousSearchList();
    });
}

function KToF (kelvin) {
    return ((kelvin - 273.15) * 9/5 + 32).toFixed(2);
}

function fiveDayForecast(lat, long) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + long + "&APPID=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        //console.log(response);

        for(var i = 0; i < 5; i++)
        {
            var day = '.day-' + (i + 1);
            var forecastDay = $(day).children();
            var dateText = response.list[i * 8].dt_txt.split(" ");
            var splitDate = dateText[0].split("-");
            var m = splitDate[1];
            var d = splitDate[2];
            var y = splitDate[0];


            $(forecastDay[0]).text(m + "/" + d + "/" + y);
            $(forecastDay[1]).attr("src", "http://openweathermap.org/img/wn/" + response.list[i * 8].weather[0].icon + ".png");
            $(forecastDay[2]).text("Temp: " + KToF(response.list[i * 8].main.temp));
            $(forecastDay[3]).text("Humidity: " + response.list[i * 8].main.humidity);
        }
    });
}

function uvIndex() {
    var queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + long + "&APPID=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        //console.log(response);

        //console.log("UVI: " + response.value);

        var uvi = response.value;
        var uviFloor = Math.floor(uvi);
        var cityDiv = $(".city").children();
        
        var low = "badge-success";
        var mod = "badge-warning";
        var hi = "badge-hi"; // css class bg-orange!
        var vhi = "badge-danger"; 
        var extreme = "badge-extreme"; // css class bg-purple

        if(uviFloor <= 2) {
            $(cityDiv[4]).html("<p mb-0>UV Index: " + "<span class=\"text-white badge " + low + "\" + style=\"font-size: 16px;\">" + uvi + "</span></p>");
        }
        else if(uviFloor >= 3 && uviFloor <= 5) {
            $(cityDiv[4]).html("<p mb-0>UV Index: " + "<span class=\"text-white badge " + mod + "\" + style=\"font-size: 16px;\">" + uvi + "</span></p>");
        }
        else if(uviFloor >= 6 && uviFloor <= 7) {
            $(cityDiv[4]).html("<p mb-0>UV Index: " + "<span class=\"text-white badge " + hi + "\" + style=\"font-size: 16px;\">" + uvi + "</span></p>");
        }
        else if(uviFloor >= 8 && uviFloor <= 10) {
            $(cityDiv[4]).html("<p mb-0>UV Index: " + "<span class=\"text-white badge " + vhi + "\" + style=\"font-size: 16px;\">" + uvi + "</span></p>");
        }
        else if(uviFloor >= 11) {
            $(cityDiv[4]).html("<p mb-0>UV Index: " + "<span class=\"text-white badge " + extreme + "\" + style=\"font-size: 16px;\">" + uvi + "</span></p>");
        }
    });
}

function previousSearchList() {
    previousSearches = JSON.parse(localStorage.getItem("searches"));

    if(previousSearches)
    {
        for(var i = 0; i < previousSearches.length; i++) {
            $('#past-search-' + i).text(previousSearches[i]);
        }
    }
}


function initialize()
{
    if(previousSearches)
    {
        city = previousSearches[0];
        grabCity(city);
    }
    else if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position);
    }

    function position(position) {
        lat = position.coords.latitude;
        long = position.coords.longitude;

        var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&appid=" + apiKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            //console.log(response);
            city = response.name;
            grabCity(city, true);
        });
    }
}

function addToPrev (cityName, add) { // function to keep the array list for local storage
    var length;
    
    if(add) { // boolean value to check if we want to add (if the user clicks on a previous search, don't add to the list)
        
        console.log(add);

        if(previousSearches != null)
        {
            length = previousSearches.length;
        }
    
        if(length === 8)
        {
            if(previousSearches[0] === cityName) {
                return;
            }
            previousSearches.pop();
            previousSearches.unshift(cityName);
        }
        else if(length)
        {
            if(previousSearches[0] === cityName) {
                return;
            }
            previousSearches.unshift(cityName);
        }
        else {
            previousSearches = [];
            previousSearches.push(cityName);
        }
    
        var json = JSON.stringify(previousSearches);
        localStorage.setItem("searches", json);

    }
}