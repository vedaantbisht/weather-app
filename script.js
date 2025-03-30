async function fetchWeather() {
  let searchInput = document.getElementById("search").value;
  const weatherDataSection = document.getElementById("weather-data");
  weatherDataSection.style.display = "block";
  const weatherApiKey = "504082a8fc4d788774a4dd619e65d05";
  const soilApiKey = "bb0664ed43c153aa072c760594d775a7";
  const polyId = "5aaa8052cbbbb5000b73ff66";

  if (searchInput === "") {
    weatherDataSection.innerHTML = `
      <div>
        <h2>Empty Input!</h2>
        <p>Please try again with a valid <u>city name</u>.</p>
      </div>
    `;
    return;
  }

  async function getLonAndLat() {
    const countryCode = "IN";
    const geocodeURL = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)},${countryCode}&limit=1&appid=${weatherApiKey}`;
    try {
      const response = await fetch(geocodeURL);
      if (!response.ok) throw new Error("Failed to fetch geolocation");
      const data = await response.json();
      if (data.length === 0) {
        weatherDataSection.innerHTML = `
          <div>
            <h2>Invalid Input: "${searchInput}"</h2>
            <p>Please try again with a valid <u>city name</u>.</p>
          </div>
        `;
        return null;
      }
      return data[0];
    } catch (error) {
      console.error("Error fetching location data:", error);
      return null;
    }
  }

  async function getWeatherData(lon, lat) {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;
    try {
      const response = await fetch(weatherURL);
      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();
      console.log("Weather Data:", data);

      const soilData = await getSoilData();

      weatherDataSection.style.display = "flex";
      weatherDataSection.innerHTML = `
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="${data.weather[0].description}" width="100" />
        <div>
          <h2>${data.name}</h2>
          <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
          <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
          <p><strong>Description:</strong> ${data.weather[0].description}</p>
          <p><strong>Soil Moisture:</strong> ${soilData.moisture}</p>
          <p><strong>Soil Temperature:</strong> ${soilData.temperature}°C</p>
        </div>
      `;
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }
  
  async function getSoilData() {
    const soilApiURL = `http://api.agromonitoring.com/agro/1.0/soil?polyid=${polyId}&appid=${soilApiKey}`;
    try {
      const response = await fetch(soilApiURL);
      if (!response.ok) throw new Error("Failed to fetch soil data");
      const data = await response.json();
      console.log("Soil Data:", data);

      return {
        moisture: data.moisture || "Unknown",
        temperature: data.t0 || "Unknown"
      };
    } catch (error) {
      console.error("Error fetching soil data:", error);
      return { moisture: "Unknown", temperature: "Unknown" };
    }
  }

  document.getElementById("search").value = "";
  const geocodeData = await getLonAndLat();
  if (geocodeData) {
    getWeatherData(geocodeData.lon, geocodeData.lat);
  }
}
