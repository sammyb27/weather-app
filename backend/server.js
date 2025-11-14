//server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

// Use process.env.PORT for Render, or the fallback from .env (e.g., 5000) for local.
const PORT = process.env.PORT || process.env.PORT; 

const API_KEY = process.env.OPEN_WEATHER_API_KEY; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// Enable CORS for communication between frontend and backend
app.use(cors());
app.use(express.json());

// Proxy endpoint to get coordinates for a city name
app.get('/api/geocode', async (req, res) => {
    const { city } = req.query;
    if (!city) {
        return res.status(400).json({ message: "City parameter is required" });
    }

    try {
        const url = `${GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Geocode API error:", error);
        res.status(500).json({ message: "Failed to fetch city coordinates" });
    }
});

// Proxy endpoint to get weather data (current, forecast, and air pollution)
app.get('/api/weather', async (req, res) => {
    const { lat, lon, type } = req.query; // 'current', 'forecast', or 'pollution'
    if (!lat || !lon || !type) {
        return res.status(400).json({ message: "Latitude, longitude, and type parameters are required" });
    }

    let url;
    switch (type) {
        case 'current':
            url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            break;
        case 'forecast':
            url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            break;
        case 'pollution':
            url = `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
            break;
        default:
            return res.status(400).json({ message: "Invalid weather data type" });
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Weather API (${type}) error:`, error);
        res.status(500).json({ message: `Failed to fetch ${type} data` });
    }
});

// Proxy endpoint for reverse geocoding (for current location)
app.get('/api/reverse-geocode', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude parameters are required" });
    }

    try {
        const url = `${GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Reverse Geocode API error:", error);
        res.status(500).json({ message: "Failed to fetch location name" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});