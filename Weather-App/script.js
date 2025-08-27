// Weather App JavaScript
class WeatherApp {
    constructor() {
        // OpenWeatherMap API configuration
        this.apiKey = CONFIG.OPENWEATHER_API_KEY;
        this.baseUrl = CONFIG.WEATHER_API_BASE_URL;
        this.iconBaseUrl = CONFIG.ICON_BASE_URL;
        
        // DOM elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.weatherSection = document.getElementById('weatherSection');
        this.errorSection = document.getElementById('errorSection');
        this.loadingSection = document.getElementById('loadingSection');
        
        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.countryName = document.getElementById('countryName');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.weatherIconImg = document.getElementById('weatherIconImg');
        
        // Error display elements
        this.errorTitle = document.getElementById('errorTitle');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.initializeEventListeners();
        this.checkApiKey();
    }
    
    initializeEventListeners() {
        // Search button click
        this.searchBtn.addEventListener('click', () => {
            this.searchWeather();
        });
        
        // Enter key press in input
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });
        
        // Location button click
        this.locationBtn.addEventListener('click', () => {
            this.getUserLocation();
        });
        
        // Input focus for better UX
        this.cityInput.addEventListener('focus', () => {
            this.cityInput.select();
        });
    }
    
    checkApiKey() {
        if (this.apiKey === 'YOUR_API_KEY_HERE') {
            this.showError(
                'API Key Required',
                CONFIG.ERROR_MESSAGES.API_KEY_MISSING
            );
        }
    }
    
    async searchWeather() {
        const city = this.cityInput.value.trim();
        
        if (!city) {
            this.showError('Input Error', 'Please enter a city name');
            return;
        }
        
        this.showLoading();
        try {
            const weatherData = await this.fetchWeatherData(city);
            this.displayWeather(weatherData);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    async getUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation Error', 'Geolocation is not supported by your browser');
            return;
        }
        
        this.showLoading();
        
        try {
            const position = await this.getCurrentPosition();
            const { latitude, longitude } = position.coords;
            const weatherData = await this.fetchWeatherDataByCoords(latitude, longitude);
            this.displayWeather(weatherData);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: CONFIG.GEOLOCATION_TIMEOUT,
                maximumAge: CONFIG.GEOLOCATION_MAX_AGE
            });
        });
    }
    
    async fetchWeatherData(city) {
        const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
            } else if (response.status === 401) {
                throw new Error('Invalid API key. Please check your OpenWeatherMap API key.');
            } else {
                throw new Error(`Weather data unavailable (${response.status}). Please try again later.`);
            }
        }
        
        return await response.json();
    }
    
    async fetchWeatherDataByCoords(lat, lon) {
        const url = `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch weather data for your location (${response.status})`);
        }
        
        return await response.json();
    }
    
    displayWeather(data) {
        // Update city and country
        this.cityName.textContent = data.name;
        this.countryName.textContent = data.sys.country;
        
        // Update temperature
        this.temperature.textContent = Math.round(data.main.temp);
        
        // Update weather description
        this.weatherDescription.textContent = data.weather[0].description;
        
        // Update humidity
        this.humidity.textContent = `${data.main.humidity}%`;
        
        // Update wind speed (convert from m/s to km/h)
        const windSpeedKmh = Math.round(data.wind.speed * 3.6);
        this.windSpeed.textContent = `${windSpeedKmh} km/h`;
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        this.weatherIconImg.src = `${this.iconBaseUrl}${iconCode}@2x.png`;
        this.weatherIconImg.alt = data.weather[0].description;
        
        // Show weather section and hide others
        this.showWeather();
        
        // Clear input
        this.cityInput.value = '';
    }
    
    showWeather() {
        this.weatherSection.style.display = 'flex';
        this.errorSection.style.display = 'none';
        this.loadingSection.style.display = 'none';
    }
    
    showError(title, message) {
        this.errorTitle.textContent = title;
        this.errorMessage.textContent = message;
        
        this.errorSection.style.display = 'flex';
        this.weatherSection.style.display = 'none';
        this.loadingSection.style.display = 'none';
    }
    
    showLoading() {
        this.loadingSection.style.display = 'flex';
        this.weatherSection.style.display = 'none';
        this.errorSection.style.display = 'none';
    }
    
    handleError(error) {
        console.error('Weather App Error:', error);
        
        if (error.name === 'GeolocationPositionError') {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    this.showError('Location Access Denied', 'Please allow location access to use this feature');
                    break;
                case error.POSITION_UNAVAILABLE:
                    this.showError('Location Unavailable', 'Your location could not be determined');
                    break;
                case error.TIMEOUT:
                    this.showError('Location Timeout', 'Location request timed out. Please try again');
                    break;
                default:
                    this.showError('Location Error', 'An unknown error occurred while getting your location');
            }
        } else {
            this.showError('Error', error.message || 'An unexpected error occurred');
        }
    }
}

// Utility functions
function formatTemperature(temp) {
    return Math.round(temp);
}

function formatWindSpeed(speed) {
    return Math.round(speed * 3.6); // Convert m/s to km/h
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Add some additional utility functions for future enhancements
const WeatherUtils = {
    // Convert temperature between units
    celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
    fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
    
    // Get weather condition emoji
    getWeatherEmoji: (weatherCode) => {
        const weatherEmojis = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return weatherEmojis[weatherCode] || '🌤️';
    },
    
    // Format date for display
    formatDate: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Get time of day
    getTimeOfDay: () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }
};
