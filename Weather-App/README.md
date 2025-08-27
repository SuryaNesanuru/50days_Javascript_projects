# Weather App 🌤️

A modern, responsive weather application built with vanilla JavaScript that provides real-time weather information for any city worldwide.

## ✨ Features

- **City Search**: Search for weather by city name
- **Real-time Data**: Get current temperature, humidity, and wind speed
- **Weather Icons**: Visual representation of weather conditions
- **Geolocation**: Automatic weather detection for your current location
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading animations and transitions
- **Modern UI**: Beautiful gradient design with glassmorphism effects

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- An OpenWeatherMap API key (free)

### Setup Instructions

1. **Get an API Key**:
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key

2. **Configure the App**:
   - Open `config.js`
   - Replace `'YOUR_API_KEY_HERE'` with your actual API key:
   ```javascript
   OPENWEATHER_API_KEY: 'your_actual_api_key_here'
   ```

3. **Run the App**:
   - Open `index.html` in your web browser
   - Or serve the files using a local server

### Local Development Server

If you want to run a local server (recommended for development):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **Vanilla JavaScript**: ES6+ features, async/await, Fetch API
- **OpenWeatherMap API**: Weather data and icons
- **Geolocation API**: Browser location services

## 📱 API Integration

The app uses the OpenWeatherMap API to fetch weather data:

- **Current Weather**: `/weather` endpoint
- **Units**: Metric (Celsius, km/h)
- **Icons**: Weather condition icons from OpenWeatherMap
- **Error Handling**: Comprehensive HTTP status code handling

### API Endpoints Used

```javascript
// Current weather by city name
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric

// Current weather by coordinates
https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric
```

## 🎨 Design Features

- **Gradient Background**: Beautiful purple-blue gradient
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Responsive Layout**: Mobile-first design approach
- **Smooth Animations**: CSS transitions and keyframe animations
- **Icon Integration**: SVG icons and weather condition images
- **Typography**: Inter font family for modern readability

## 📁 Project Structure

```
Weather-App/
├── index.html          # Main HTML structure
├── style.css           # CSS styles and animations
├── config.js           # Configuration file
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## 🔧 Customization

### Changing Colors

Modify the CSS variables in `style.css`:

```css
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

### Adding New Weather Data

Extend the `displayWeather` method in `script.js` to show additional information like:
- Pressure
- Sunrise/sunset times
- UV index
- Air quality

### Unit Conversion

The app includes utility functions for temperature and wind speed conversion:

```javascript
// Convert Celsius to Fahrenheit
const fahrenheit = WeatherUtils.celsiusToFahrenheit(25);

// Convert wind speed from m/s to km/h
const windKmh = formatWindSpeed(5.5);
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure you've replaced the placeholder with your actual API key
2. **CORS Issues**: Use a local server instead of opening the HTML file directly
3. **Geolocation Not Working**: Ensure your browser supports geolocation and you've granted permission
4. **City Not Found**: Check the spelling of the city name

### Browser Compatibility

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 📈 Future Enhancements

- [ ] 5-day weather forecast
- [ ] Temperature unit toggle (Celsius/Fahrenheit)
- [ ] Weather alerts and notifications
- [ ] Multiple city favorites
- [ ] Weather maps integration
- [ ] Dark/light theme toggle
- [ ] Offline support with service workers
- [ ] Weather history and trends

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather API
- [Inter Font](https://rsms.me/inter/) for the beautiful typography
- [Feather Icons](https://feathericons.com/) for the SVG icons

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure your API key is valid and active
4. Verify your internet connection

---

**Happy Weather Watching! ☀️🌧️❄️**
