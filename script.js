// script.js

const apiKey = "752a9c372f9fd59ed3d7fe0704a3d68a";
const apiURL = "https://api.openweathermap.org/data/2.5/weather";
const forecastAPIURL = "https://api.openweathermap.org/data/2.5/forecast";
const recentCitiesKey = "recentCities";

// Fetch weather data based on city name
function fetchWeatherData() {
  const city = document.getElementById("city-name-input").value.trim();

  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  const url = `${apiURL}?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found.");
      }
      return response.json();
    })
    .then(data => {
      displayWeatherData(data);
      fetchForecastData(city);
      updateRecentSearches(city);
    })
    .catch(error => {
      alert(error.message);
      console.error("Error fetching weather data:", error);
    });
}

// Fetch weather data based on user's current location
function fetchLocationWeather() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `${apiURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error("Unable to fetch weather data for your location.");
        }
        return response.json();
      })
      .then(data => {
        displayWeatherData(data);
        fetchForecastDataFromCoords(lat, lon);
      })
      .catch(error => {
        alert(error.message);
        console.error("Error fetching location weather data:", error);
      });
  }, () => {
    alert("Unable to retrieve your location.");
  });
}

// Fetch forecast data based on city name
function fetchForecastData(city) {
  const url = `${forecastAPIURL}?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Unable to fetch forecast data.");
      }
      return response.json();
    })
    .then(data => {
      displayForecastData(data);
    })
    .catch(error => {
      alert(error.message);
      console.error("Error fetching forecast data:", error);
    });
}

// Fetch forecast data based on coordinates
function fetchForecastDataFromCoords(lat, lon) {
  const url = `${forecastAPIURL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Unable to fetch forecast data.");
      }
      return response.json();
    })
    .then(data => {
      displayForecastData(data);
    })
    .catch(error => {
      alert(error.message);
      console.error("Error fetching forecast data:", error);
    });
}

// Display current weather data
function displayWeatherData(data) {
  const cityName = data.name;
  const temperature = `${Math.round(data.main.temp)}°C`;
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Display the result
  document.getElementById("output-city-name").textContent = cityName;
  document.getElementById("output-temp").textContent = temperature;
  document.getElementById("output-desc").textContent = description;
  document.getElementById("output-icon").src = iconURL;
  document.getElementById("weather-output").classList.remove("hidden");
}

// Display forecast data
function displayForecastData(data) {
  const forecastContainer = document.querySelector("#forecast-container");
  const forecastGrid = forecastContainer.querySelector(".grid");
  forecastGrid.innerHTML = ""; // Clear previous cards

  // Filter to get one forecast around midday for each day
  const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyForecasts.forEach(forecast => {
    const date = new Date(forecast.dt_txt).toDateString();
    const temp = `${Math.round(forecast.main.temp)}°C`;
    const desc = forecast.weather[0].description;
    const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;

    const card = document.createElement("div");
    card.className = "bg-gray-900 text-center rounded-xl p-4 shadow-lg border border-indigo-700";
    card.innerHTML = `
      <h4 class="text-purple-300 font-bold mb-1">${date}</h4>
      <img src="${icon}" alt="Weather icon" class="w-16 h-16 mx-auto mb-2" />
      <p class="text-xl font-semibold text-blue-300">${temp}</p>
      <p class="text-sm text-gray-400 italic">${desc}</p>
    `;

    forecastGrid.appendChild(card);
  });

  // Show forecast section
  forecastContainer.classList.remove("hidden");
}

// Update the list of recently searched cities
function updateRecentSearches(city) {
  let recentCities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) {
      recentCities.pop(); // Keep only the last 5 cities
    }
    localStorage.setItem(recentCitiesKey, JSON.stringify(recentCities));
    populateRecentSearchesDropdown();
  }
}

// Populate the dropdown menu with recently searched cities
function populateRecentSearchesDropdown() {
  const dropdown = document.getElementById("recent-searches");
  dropdown.innerHTML = '<option value="">Select a city</option>'; // Clear existing options

  const recentCities = JSON.parse(localStorage.getItem(recentCitiesKey)) || [];
  recentCities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    dropdown.appendChild(option);
  });
}

// Handle selection of a city from the dropdown
function selectCityFromDropdown() {
  const city = document.getElementById("recent-searches").value;
  if (city) {
    document.getElementById("city-name-input").value = city;
    fetchWeatherData();
  }
}

// Validate user inputs to prevent errors
function validateCityInput() {
  const cityInput = document.getElementById("city-name-input").value.trim();
  if (cityInput === "") {
    alert("City name cannot be empty.");
    return false;
  }
  return true;
}

// Initialize the app
function init() {
  populateRecentSearchesDropdown();

}