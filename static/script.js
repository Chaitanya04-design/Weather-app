const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const weatherSection =
    document.getElementById("weatherSection");

const emptyState =
    document.getElementById("emptyState");

const loading =
    document.getElementById("loading");

const message =
    document.getElementById("message");

const cityName =
    document.getElementById("cityName");

const countryName =
    document.getElementById("countryName");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const condition =
    document.getElementById("condition");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const wind =
    document.getElementById("wind");

const pressure =
    document.getElementById("pressure");

const dayStatus =
    document.getElementById("dayStatus");

const hourly =
    document.getElementById("hourly");

const forecast =
    document.getElementById("forecast");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const uvIndex =
    document.getElementById("uvIndex");


/* =========================================
   WEATHER CODES
========================================= */

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

    56: ["Freezing drizzle", "🌧️"],

    57: ["Heavy freezing drizzle", "🌧️"],

    61: ["Light rain", "🌦️"],

    63: ["Rain", "🌧️"],

    65: ["Heavy rain", "🌧️"],

    66: ["Freezing rain", "🌧️"],

    67: ["Heavy freezing rain", "🌧️"],

    71: ["Light snow", "🌨️"],

    73: ["Snow", "❄️"],

    75: ["Heavy snow", "❄️"],

    77: ["Snow grains", "❄️"],

    80: ["Rain showers", "🌦️"],

    81: ["Rain showers", "🌧️"],

    82: ["Heavy showers", "⛈️"],

    85: ["Snow showers", "🌨️"],

    86: ["Heavy snow showers", "❄️"],

    95: ["Thunderstorm", "⛈️"],

    96: ["Thunderstorm with hail", "⛈️"],

    99: ["Thunderstorm with hail", "⛈️"]

};


function weatherInfo(code) {

    return (
        weatherTypes[code] ||
        ["Unknown", "🌡️"]
    );

}


/* =========================================
   TIME HELPERS
========================================= */

function timeOnly(value) {

    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleTimeString(
        "en-IN",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


function dayOnly(value) {

    if (!value) {
        return "—";
    }

    return new Date(
        `${value}T12:00:00`
    ).toLocaleDateString(
        "en-IN",
        {
            weekday: "short"
        }
    );

}


/* =========================================
   SEARCH WEATHER
========================================= */

async function searchWeather() {

    const city =
        cityInput.value.trim();


    if (!city) {

        message.textContent =
            "Please enter a city name.";

        emptyState.classList.remove("hidden");

        weatherSection.classList.add("hidden");

        return;

    }


    message.textContent = "";

    weatherSection.classList.add("hidden");

    emptyState.classList.add("hidden");

    loading.classList.remove("hidden");


    try {

        /*
            STEP 1
            Browser → Open-Meteo Geocoding
        */

        const geoURL =
            new URL(
                "https://geocoding-api.open-meteo.com/v1/search"
            );


        geoURL.searchParams.set(
            "name",
            city
        );


        geoURL.searchParams.set(
            "count",
            "1"
        );


        geoURL.searchParams.set(
            "language",
            "en"
        );


        geoURL.searchParams.set(
            "format",
            "json"
        );


        const geoResponse =
            await fetch(
                geoURL.toString()
            );


        if (!geoResponse.ok) {

            throw new Error(
                "Unable to search for this city right now."
            );

        }


        const geoData =
            await geoResponse.json();


        if (
            !geoData.results ||
            geoData.results.length === 0
        ) {

            throw new Error(
                "City not found. Please check the spelling."
            );

        }


        const location =
            geoData.results[0];


        /*
            STEP 2
            Browser → Open-Meteo Forecast
        */

        const weatherURL =
            new URL(
                "https://api.open-meteo.com/v1/forecast"
            );


        weatherURL.searchParams.set(
            "latitude",
            String(location.latitude)
        );


        weatherURL.searchParams.set(
            "longitude",
            String(location.longitude)
        );


        weatherURL.searchParams.set(
            "current",
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "weather_code",
                "wind_speed_10m",
                "wind_direction_10m",
                "pressure_msl"
            ].join(",")
        );


        weatherURL.searchParams.set(
            "hourly",
            [
                "temperature_2m",
                "weather_code",
                "precipitation_probability"
            ].join(",")
        );


        weatherURL.searchParams.set(
            "daily",
            [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "sunrise",
                "sunset",
                "uv_index_max",
                "precipitation_probability_max"
            ].join(",")
        );


        weatherURL.searchParams.set(
            "forecast_days",
            "7"
        );


        weatherURL.searchParams.set(
            "timezone",
            "auto"
        );


        const weatherResponse =
            await fetch(
                weatherURL.toString()
            );


        if (!weatherResponse.ok) {

            if (
                weatherResponse.status === 429
            ) {

                throw new Error(
                    "The weather service is temporarily rate-limited. Please wait a moment and try again."
                );

            }


            throw new Error(
                "Unable to load weather data right now."
            );

        }


        const weather =
            await weatherResponse.json();


        if (
            !weather.current ||
            !weather.hourly ||
            !weather.daily
        ) {

            throw new Error(
                "The weather service returned incomplete data."
            );

        }


        /*
            Create the same data structure
            used by the display functions.
        */

        const data = {

            location: {

                name:
                    location.name,

                country:
                    location.country || "",

                admin1:
                    location.admin1 || "",

                latitude:
                    location.latitude,

                longitude:
                    location.longitude

            },

            current:
                weather.current,

            hourly:
                weather.hourly,

            daily:
                weather.daily

        };


        showWeather(data);

    }


    catch (error) {

        console.error(
            "Weather request failed:",
            error
        );


        message.textContent =
            error.message ||
            "Something went wrong while loading the weather.";


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


/* =========================================
   DISPLAY WEATHER
========================================= */

function showWeather(data) {

    const location =
        data.location;

    const current =
        data.current;

    const daily =
        data.daily;


    /*
        LOCATION
    */

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


    /*
        CURRENT WEATHER
    */

    const info =
        weatherInfo(
            current.weather_code
        );


    weatherIcon.textContent =
        info[1];


    temperature.textContent =
        Math.round(
            Number(
                current.temperature_2m
            )
        );


    condition.textContent =
        info[0];


    feelsLike.textContent =
        Math.round(
            Number(
                current.apparent_temperature
            )
        );


    humidity.textContent =
        Math.round(
            Number(
                current.relative_humidity_2m
            )
        );


    wind.textContent =
        Math.round(
            Number(
                current.wind_speed_10m
            )
        );


    pressure.textContent =
        Math.round(
            Number(
                current.pressure_msl
            )
        );


    dayStatus.textContent =
        Number(
            current.is_day
        ) === 1
            ? "Daytime"
            : "Nighttime";


    /*
        SUN INFORMATION
    */

    sunrise.textContent =
        timeOnly(
            daily.sunrise[0]
        );


    sunset.textContent =
        timeOnly(
            daily.sunset[0]
        );


    uvIndex.textContent =
        Number(
            daily.uv_index_max[0]
        ).toFixed(1);


    /*
        FORECASTS
    */

    buildHourly(
        data.hourly
    );


    buildForecast(
        data.daily
    );


    /*
        SHOW
    */

    weatherSection.classList.remove(
        "hidden"
    );


    emptyState.classList.add(
        "hidden"
    );


    message.textContent = "";


    /*
        Smoothly move to weather.
    */

    setTimeout(
        function () {

            weatherSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        100
    );

}


/* =========================================
   HOURLY FORECAST
========================================= */

function buildHourly(data) {

    hourly.innerHTML = "";


    if (
        !data ||
        !data.time ||
        data.time.length === 0
    ) {

        hourly.innerHTML =
            "<p>No hourly forecast available.</p>";

        return;

    }


    const now =
        new Date();


    let start =
        0;


    /*
        Find the first future hour.
    */

    for (
        let i = 0;
        i < data.time.length;
        i++
    ) {

        if (
            new Date(
                data.time[i]
            ) >= now
        ) {

            start = i;

            break;

        }

    }


    /*
        Show 8 hours.
    */

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
            document.createElement(
                "div"
            );


        card.className =
            "hour-card";


        const rain =
            data.precipitation_probability &&
            data.precipitation_probability[i] !== undefined
                ? data.precipitation_probability[i]
                : 0;


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
                    Number(
                        data.temperature_2m[i]
                    )
                )}°
            </div>

            <div class="hour-rain">
                ${rain}% rain
            </div>

        `;


        hourly.appendChild(card);

    }

}


/* =========================================
   7-DAY FORECAST
========================================= */

function buildForecast(data) {

    forecast.innerHTML = "";


    if (
        !data ||
        !data.time ||
        data.time.length === 0
    ) {

        forecast.innerHTML =
            "<p>No forecast available.</p>";

        return;

    }


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
            document.createElement(
                "div"
            );


        card.className =
            "forecast-card";


        const rain =
            data.precipitation_probability_max &&
            data.precipitation_probability_max[i] !== undefined
                ? data.precipitation_probability_max[i]
                : 0;


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
                    Number(
                        data.temperature_2m_max[i]
                    )
                )}°
            </div>


            <div class="forecast-low">
                ${Math.round(
                    Number(
                        data.temperature_2m_min[i]
                    )
                )}°
            </div>


            <div class="forecast-rain">
                ${rain}% rain
            </div>

        `;


        forecast.appendChild(card);

    }

}


/* =========================================
   SEARCH BUTTON
========================================= */

searchButton.addEventListener(
    "click",
    searchWeather
);


/* =========================================
   ENTER KEY
========================================= */

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            searchWeather();

        }

    }
);
