// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.OPENWEATHER_API_KEY;

// Enable CORS so your frontend can communicate with this backend
app.use(cors());

// Default route (for testing)
app.get("/", (req, res) => {
  res.send("🌦 Weather App Backend is running successfully!");
});

// Weather route - fetches weather data securely
app.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: "City name is required." });
  }

  try {
    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;

    const response = await fetch(weatherURL);
    const data = await response.json();

    if (data.cod !== 200) {
      return res
        .status(data.cod)
        .json({ error: data.message || "Error fetching weather data." });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching weather:", error);
    res.status(500).json({ error: "Server error fetching weather data." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});