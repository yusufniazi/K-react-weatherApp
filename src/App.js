/** @jsxImportSource https://esm.sh/react@18.2.0 */
import React, { useState, useEffect } from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";

function WeatherDashboard() {
  const [cityName, setCityName] = useState('New York');
  const [location, setLocation] = useState({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => {
    // Initialize theme from localStorage or default to light
    return localStorage.getItem('weatherAppTheme') || 'light';
  });

  // Theme colors
  const themes = {
    light: {
      background: '#ffffff',
      text: '#333333',
      inputBg: '#f4f4f4',
      cardBg: '#f9f9f9',
      border: '#e0e0e0'
    },
    dark: {
      background: '#121212',
      text: '#ffffff',
      inputBg: '#1e1e1e',
      cardBg: '#1f1f1f',
      border: '#333333'
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('weatherAppTheme', newTheme);
  };

  useEffect(() => {
    async function fetchGeocode() {
      try {
        // Use Open-Meteo's geocoding API (free and no key required)
        const geocodeResponse = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.results && geocodeData.results.length > 0) {
          const { latitude, longitude } = geocodeData.results[0];
          setLocation({ latitude, longitude });
          setError(null);
        } else {
          setError('City not found. Please try another name.');
          setWeather(null);
        }
      } catch (error) {
        console.error("Geocoding fetch failed", error);
        setError('Failed to find city coordinates');
        setWeather(null);
      }
    }

    fetchGeocode();
  }, [cityName]);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        console.error("Weather fetch failed", error);
        setLoading(false);
        setError('Failed to fetch weather data');
      }
    }

    fetchWeather();
  }, [location]);

  const weatherCodes = {
    0: "☀️ Clear sky",
    1: "🌤️ Mainly clear",
    2: "⛅ Partly cloudy",
    3: "☁️ Overcast",
    45: "🌫️ Foggy",
    48: "🌫️ Depositing rime fog",
    51: "🌧️ Light drizzle",
    53: "🌧️ Moderate drizzle",
    55: "🌧️ Dense drizzle",
    61: "🌧️ Slight rain",
    63: "🌧️ Moderate rain",
    65: "🌧️ Heavy rain",
    71: "❄️ Slight snow fall",
    73: "❄️ Moderate snow fall",
    75: "❄️ Heavy snow fall",
    77: "❄️ Snow grains",
    80: "🌧️ Slight rain showers",
    81: "🌧️ Moderate rain showers",
    82: "🌧️ Violent rain showers",
    85: "❄️ Slight snow showers",
    86: "❄️ Heavy snow showers",
    95: "⛈️ Thunderstorm",
    96: "⛈️ Thunderstorm with light hail",
    99: "⛈️ Thunderstorm with heavy hail"
  };

  const handleCitySearch = (e) => {
    if (e.key === 'Enter') {
      setCityName(e.target.value);
    }
  };

  const currentTheme = themes[theme];

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '600px', 
      margin: 'auto', 
      padding: '20px',
      backgroundColor: currentTheme.background,
      color: currentTheme.text,
      minHeight: '100vh',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>🌦️ Weather Dashboard</h1>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: `1px solid ${currentTheme.text}`,
            color: currentTheme.text,
            padding: '10px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
      <input 
        type="text" 
        placeholder="Enter city name (e.g. London, Paris, Tokyo)" 
        defaultValue={cityName}
        onKeyDown={handleCitySearch}
        style={{ 
          width: '100%', 
          padding: '10px', 
          marginBottom: '20px',
          backgroundColor: currentTheme.inputBg,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.border}`,
          borderRadius: '5px'
        }}
      />
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading weather data...</p>
      ) : weather ? (
        <div>
          <h2>Current Weather</h2>
          <p>📍 Location: {cityName} ({location.latitude}, {location.longitude})</p>
          <p>🌡️ Temperature: {weather.current_weather.temperature}°C</p>
          <p>🌈 Condition: {weatherCodes[weather.current_weather.weathercode]}</p>
          
          <h2>Daily Forecast</h2>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            overflowX: 'auto' 
          }}>
            {weather.daily.time.map((date, index) => (
              <div key={date} style={{ 
                textAlign: 'center', 
                padding: '10px', 
                border: `1px solid ${currentTheme.border}`, 
                minWidth: '120px', 
                margin: '0 5px',
                backgroundColor: currentTheme.cardBg,
                borderRadius: '5px'
              }}>
                <p>{new Date(date).toLocaleDateString()}</p>
                <p>🌡️ High: {weather.daily.temperature_2m_max[index]}°C</p>
                <p>🌡️ Low: {weather.daily.temperature_2m_min[index]}°C</p>
                <p>{weatherCodes[weather.daily.weathercode[index]]}</p>
              </div>
            ))}
          </div>
          <p>
            <a 
              href={import.meta.url.replace("esm.town", "val.town")} 
              target="_top" 
              style={{ color: currentTheme.text, textDecoration: 'none', opacity: 0.7 }}
            >
              View Source
            </a>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<WeatherDashboard />);
}
if (typeof document !== "undefined") { client(); }

export default async function server(request: Request): Promise<Response> {
  return new Response(`
    <html>
      <head>
        <title>Weather Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `, {
    headers: { "content-type": "text/html" }
  });
}