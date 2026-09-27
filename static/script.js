const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");

const weatherSection = document.getElementById("weatherSection");
const emptyState = document.getElementById("emptyState");

const loading = document.getElementById("loading");
const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");

const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

const dayStatus = document.getElementById("dayStatus");

const hourly = document.getElementById("hourly");
const forecast = document.getElementById("forecast");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const uvIndex = document.getElementById("uvIndex");


/* WEATHER CODES */

const weatherTypes = {

    0: ["Clear sky", "☀️"],

    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],

    45: ["Fog", "🌫️"],
    48: ["Fog", "🌫️"],

    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌧️"],

    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],

    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "❄️"],

    80: ["Rain showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Heavy showers", "⛈️"],

    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm", "⛈️"],
    99: ["Thunderstorm", "⛈️"]
};


function weatherInfo(code) {

    return weatherTypes[code] || [
        "Unknown",
        "🌡️"
    ];

}


/* TIME */

function timeOnly(value) {

    return new Date(value).toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


function dayOnly(value) {

    return new Date(
        value + "T12:00:00"
    ).toLocaleDateString(
        "en-IN",
        {
            weekday: "short"
        }
    );

}


/* SEARCH */

async function searchWeather() {

    const city =
        cityInput.value.trim();


    if (!city) {

        message.textContent =
            "Please enter a city name.";

        return;

    }


    message.textContent = "";

    weatherSection.classList.add("hidden");

    emptyState.classList.add("hidden");

    loading.classList.remove("hidden");


    try {

        /*
         * Browser
         *    ↓
         * Flask
         *    ↓
         * Open-Meteo
         */

        const response =
            await fetch(
                `/api/weather?city=${encodeURIComponent(city)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Weather could not be loaded."
            );

        }


        showWeather(data);

    }

    catch (error) {

        console.error(error);

        message.textContent =
            error.message;

        emptyState.classList.remove(
            "hidden"
        );

    }

    finally {

        loading.classList.add(
            "hidden"
        );

    }

}


/* DISPLAY WEATHER */

function showWeather(data) {

    const location =
        data.location;

    const current =
        data.current;

    const daily =
        data.daily;


    /* LOCATION */

    cityName.textContent =
        location.name;


    countryName.textContent =
        location.admin1
            ? `${location.admin1}, ${location.country}`
            : location.country;


    latitude.textContent =
        Number(
            location.latitude
        ).toFixed(2);


    longitude.textContent =
        Number(
            location.longitude
        ).toFixed(2);


    /* CURRENT */

    const info =
        weatherInfo(
            current.weather_code
        );


    weatherIcon.textContent =
        info[1];


    temperature.textContent =
        Math.round(
            current.temperature_2m
        );


    condition.textContent =
        info[0];


    feelsLike.textContent =
        Math.round(
            current.apparent_temperature
        );


    humidity.textContent =
        current.relative_humidity_2m;


    wind.textContent =
        Math.round(
            current.wind_speed_10m
        );


    pressure.textContent =
        Math.round(
            current.pressure_msl
        );


    dayStatus.textContent =
        current.is_day
            ? "Daytime"
            : "Nighttime";


    /* SUN */

    sunrise.textContent =
        timeOnly(
            daily.sunrise[0]
        );


    sunset.textContent =
        timeOnly(
            daily.sunset[0]
        );


    uvIndex.textContent =
        Math.round(
            daily.uv_index_max[0]
        );


    /* HOURLY */

    buildHourly(
        data.hourly
    );


    /* 7 DAYS */

    buildForecast(
        daily
    );


    /* SHOW */

    weatherSection.classList.remove(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    message.textContent = "";


    window.scrollTo({
        top: weatherSection.offsetTop - 20,
        behavior: "smooth"
    });

}


/* HOURLY */

function buildHourly(data) {

    hourly.innerHTML = "";


    const now =
        new Date();


    let start = 0;


    for (
        let i = 0;
        i < data.time.length;
        i++
    ) {

        if (
            new Date(data.time[i]) >= now
        ) {

            start = i;

            break;

        }

    }


    for (
        let i = start;
        i < start + 8 &&
        i < data.time.length;
        i++
    ) {

        const info =
            weatherInfo(
                data.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "hour-card";


        card.innerHTML = `

            <div class="hour-time">
                ${
                    i === start
                        ? "NOW"
                        : timeOnly(
                            data.time[i]
                        )
                }
            </div>

            <div class="hour-icon">
                ${info[1]}
            </div>

            <div class="hour-temp">
                ${Math.round(
                    data.temperature_2m[i]
                )}°
            </div>

            <div class="hour-rain">
                ${data.precipitation_probability[i]}% rain
            </div>

        `;


        hourly.appendChild(card);

    }

}


/* 7-DAY FORECAST */

function buildForecast(data) {

    forecast.innerHTML = "";


    for (
        let i = 0;
        i < data.time.length;
        i++
    ) {

        const info =
            weatherInfo(
                data.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        card.innerHTML = `

            <div class="forecast-day">

                ${
                    i === 0
                        ? "TODAY"
                        : dayOnly(
                            data.time[i]
                        )
                }

            </div>

            <div class="forecast-icon">
                ${info[1]}
            </div>

            <div class="forecast-high">
                ${Math.round(
                    data.temperature_2m_max[i]
                )}°
            </div>

            <div class="forecast-low">
                ${Math.round(
                    data.temperature_2m_min[i]
                )}°
            </div>

            <div class="forecast-rain">
                ${data.precipitation_probability_max[i]}% rain
            </div>

        `;


        forecast.appendChild(card);

    }

}


/* BUTTON */

searchButton.addEventListener(
    "click",
    searchWeather
);


/* ENTER */

cityInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            searchWeather();

        }

    }
);
