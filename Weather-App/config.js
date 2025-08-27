// Weather App Configuration
// Replace the values below with your actual configuration

const CONFIG = {
    // OpenWeatherMap API Configuration
    OPENWEATHER_API_KEY: 'YOUR_API_KEY_HERE', // Get your free API key from openweathermap.org/api
    
    // API Endpoints
    WEATHER_API_BASE_URL: 'https://api.openweathermap.org/data/2.5/weather',
    ICON_BASE_URL: 'https://openweathermap.org/img/wn/',
    
    // App Settings
    DEFAULT_UNITS: 'metric', // 'metric' for Celsius, 'imperial' for Fahrenheit
    GEOLOCATION_TIMEOUT: 10000, // 10 seconds
    GEOLOCATION_MAX_AGE: 300000, // 5 minutes
    
    // UI Settings
    ANIMATION_DURATION: 600, // milliseconds
    LOADING_DELAY: 1000, // milliseconds
    
    // Error Messages
    ERROR_MESSAGES: {
        API_KEY_MISSING: 'Please configure your OpenWeatherMap API key in config.js',
        CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        LOCATION_DENIED: 'Location access denied. Please allow location access in your browser.',
        LOCATION_UNAVAILABLE: 'Location unavailable. Please try again later.',
        LOCATION_TIMEOUT: 'Location request timed out. Please try again.'
    }
};

// Export configuration (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
