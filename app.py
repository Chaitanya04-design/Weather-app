from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/weather")
def get_weather():

    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({
            "error": "Please enter a city name."
        }), 400

    try:
        # -----------------------------
        # FIND CITY
        # -----------------------------

        geo_response = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={
                "name": city,
                "count": 1,
                "language": "en",
                "format": "json"
            },
            timeout=10
        )

        geo_response.raise_for_status()

        geo_data = geo_response.json()

        if not geo_data.get("results"):
            return jsonify({
                "error": "City not found."
            }), 404

        location = geo_data["results"][0]

        latitude = location["latitude"]
        longitude = location["longitude"]

        # -----------------------------
        # WEATHER
        # -----------------------------

        weather_response = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,

                "current": ",".join([
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "is_day",
                    "weather_code",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "pressure_msl"
                ]),

                "hourly": ",".join([
                    "temperature_2m",
                    "weather_code",
                    "precipitation_probability"
                ]),

                "daily": ",".join([
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "sunrise",
                    "sunset",
                    "uv_index_max",
                    "precipitation_probability_max"
                ]),

                "forecast_days": 7,
                "timezone": "auto"
            },

            timeout=10
        )

        weather_response.raise_for_status()

        weather = weather_response.json()

        # -----------------------------
        # SEND DATA TO WEBSITE
        # -----------------------------

        return jsonify({
            "location": {
                "name": location.get("name", city),
                "country": location.get("country", ""),
                "admin1": location.get("admin1", ""),
                "latitude": latitude,
                "longitude": longitude
            },

            "current": weather["current"],
            "hourly": weather["hourly"],
            "daily": weather["daily"]
        })

    except requests.exceptions.RequestException as error:

        print("API ERROR:", error)

        return jsonify({
            "error": "Unable to connect to weather service."
        }), 500

    except Exception as error:

        print("SERVER ERROR:", error)

        return jsonify({
            "error": "Something went wrong."
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )