document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.querySelector(".material-symbols-outlined");
    const searchBar = document.querySelector(".search-bar");
    const cityElement = document.querySelector(".city");
    const temperatureElement = document.querySelector(".temperature");
    const descriptionElement = document.querySelector(".description");
    const tempRangeElement = document.querySelector(".temp-range");
    const windElement = document.querySelector(".weather-details .detail-item:nth-child(1) div:nth-child(2)");
    const precipitationElement = document.querySelector(".weather-details .detail-item:nth-child(2) div:nth-child(2)");
    const conditionElement = document.querySelector(".condition");

    const colorPalettes = [
        { backgroundColor: "#F7D101", contentColor: "#000000" },
        { backgroundColor: "#12229D", contentColor: "#F4F6FC" },
        { backgroundColor: "#760504", contentColor: "#FBDC6A" },
        { backgroundColor: "#155E14", contentColor: "#D2FFAA" },
        { backgroundColor: "#D7DF23", contentColor: "#152039" },
        { backgroundColor: "#d7df23", contentColor: "#152039" },
        { backgroundColor: "#4c7031", contentColor: "#ffffff" },
        { backgroundColor: "#503530", contentColor: "#ede8ea" },
        { backgroundColor: "#001f3d", contentColor: "#f8dcbf" },
        { backgroundColor: "#e84e38", contentColor: "#d2ffaa" },
        { backgroundColor: "#2b4743", contentColor: "#ffd3db" },
        { backgroundColor: "#ffc61a", contentColor: "#372a28" },
        { backgroundColor: "#88ca5e", contentColor: "#155e14" },
        { backgroundColor: "#8c3839", contentColor: "#ffd3db" },
        { backgroundColor: "#810947", contentColor: "#FFFFFF" },
        { backgroundColor: "#763c00", contentColor: "#f9f7dc" },
        { backgroundColor: "#ffce6d", contentColor: "#291b25" },
        { backgroundColor: "#CAE8FF", contentColor: "#050A30" },
        { backgroundColor: "#2B192E", contentColor: "#F5E8DA" },
        { backgroundColor: "#7B3911", contentColor: "#EBA327" },
        { backgroundColor: "#E1F16B", contentColor: "#272727" },
        { backgroundColor: "#E3DDDC", contentColor: "#2F3B69" },
        { backgroundColor: "#795833", contentColor: "#F0DFC8" },
        { backgroundColor: "#AFC1D0", contentColor: "#0B1320" },
        { backgroundColor: "#EDFFCC", contentColor: "#81B622" },
        { backgroundColor: "#745E4D", contentColor: "#F8F7F4" }
    ];

    const applyRandomColorPalette = () => {
        const randomPalette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
        document.body.style.backgroundColor = randomPalette.backgroundColor;
        document.documentElement.style.setProperty("--content-color", randomPalette.contentColor);
    };

    const fetchWeatherData = (city) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                const data = JSON.parse(this.responseText);
                updateWeatherData(data);
                fetchPast12HoursWeatherData(city); // Fetch past 12-hour weather data after updating the current weather data
                applyRandomColorPalette(); // Apply color palette after fetching data
            }
        });

        const query = `https://weatherapi-com.p.rapidapi.com/current.json?q=${encodeURIComponent(city)}`;
        xhr.open("GET", query);
        xhr.setRequestHeader("x-rapidapi-key", "fd4a51179fmsh87677cfe4263525p17d2fejsn16fd16e2b2ca");
        xhr.setRequestHeader("x-rapidapi-host", "weatherapi-com.p.rapidapi.com");

        xhr.send(null);
    };

    const fetchPast12HoursWeatherData = (city) => {
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
                const data = JSON.parse(this.responseText);
                updatePast12HoursWeatherData(data);
            }
        });

        const query = `https://weatherapi-com.p.rapidapi.com/history.json?q=${encodeURIComponent(city)}&dt=${getTodayDate()}`;
        xhr.open("GET", query);
        xhr.setRequestHeader("x-rapidapi-key", "fd4a51179fmsh87677cfe4263525p17d2fejsn16fd16e2b2ca");
        xhr.setRequestHeader("x-rapidapi-host", "weatherapi-com.p.rapidapi.com");

        xhr.send(null);
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const updateWeatherData = (data) => {
        cityElement.textContent = data.location.name;
        temperatureElement.textContent = `${data.current.temp_c}°C`;
        descriptionElement.textContent = data.current.condition.text;
        tempRangeElement.textContent = `${data.current.temp_c - 1}°C - ${data.current.temp_c + 1}°C`;
        windElement.textContent = `${data.current.wind_kph} km/h`;
        precipitationElement.textContent = `${data.current.precip_mm} mm`;

        // Update condition based on weather condition codes
        const conditionCodes = {
            "rainy": [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195],
            "cloudy": [1003, 1006, 1009, 1030],
            "summer": [1000],
            "light thunderstorm": [1087, 1273],
            "thunderstorm": [1087, 1276],
            "cold": [1066, 1069, 1072, 1210, 1213, 1216, 1219, 1222, 1225, 1249, 1252, 1255, 1258, 1261, 1264],
            "heavy rain": [1192, 1195, 1204, 1207, 1243, 1246]
        };

        let conditionText = "Clear";
        for (const [key, codes] of Object.entries(conditionCodes)) {
            if (codes.includes(data.current.condition.code)) {
                conditionText = key.charAt(0).toUpperCase() + key.slice(1);
                break;
            }
        }

        conditionElement.textContent = conditionText;
    };

    const updatePast12HoursWeatherData = (data) => {
        const hourlyForecast = document.querySelector(".hourly-forecast");
        hourlyForecast.innerHTML = "<h3>Past 12 Hour</h3>";

        const currentTime = new Date();
        const past12Hours = data.forecast.forecastday[0].hour.filter(hourData => {
            const hourTime = new Date(hourData.time);
            return currentTime - hourTime <= 12 * 60 * 60 * 1000 && hourTime <= currentTime; // Only include past 12 hours
        });

        past12Hours.forEach(hour => {
            const hourlyItem = document.createElement("div");
            hourlyItem.className = "hourly-item";
            hourlyItem.innerHTML = `
                <span>${new Date(hour.time).getHours() % 12 || 12} ${new Date(hour.time).getHours() < 12 ? "AM" : "PM"}</span>
                <span>${hour.condition.text}</span>
                <span>${hour.temp_c}°C</span>
            `;
            hourlyForecast.appendChild(hourlyItem);
        });
    };

    searchButton.addEventListener("click", () => {
        const city = searchBar.value.trim();
        if (city) {
            fetchWeatherData(city);
        }
    });

    searchBar.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const city = searchBar.value.trim();
            if (city) {
                fetchWeatherData(city);
            }
        }
    });

    // Default city weather data on load
    fetchWeatherData("Bangalore");
});
