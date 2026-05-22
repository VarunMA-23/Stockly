import { weather as weatherConfig } from "../config.js"

const cache = new Map()

const getDateKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const conditionMapper = {
  Sunny: "Clear",
  Clear: "Clear",
  "Partly cloudy": "Cloudy",
  Cloudy: "Cloudy",
  Overcast: "Cloudy",
  Mist: "Foggy",
  Fog: "Foggy",
  "Freezing fog": "Foggy",
  "Patchy rain possible": "Rainy",
  "Patchy light rain": "Rainy",
  "Light rain": "Rainy",
  "Moderate rain": "Rainy",
  "Heavy rain": "Rainy",
  "Patchy light drizzle": "Rainy",
  "Light drizzle": "Rainy",
  "Moderate or heavy rain with thunder": "Stormy",
  "Patchy light rain with thunder": "Stormy",
  "Moderate or heavy rain showers": "Rainy",
  "Light rain shower": "Rainy",
  "Torrential rain shower": "Rainy",
  "Thundery outbreaks possible": "Stormy",
  "Blizzard": "Snowy",
  "Blowing snow": "Snowy",
  "Patchy snow possible": "Snowy",
  "Patchy light snow": "Snowy",
  "Light snow": "Snowy",
  Haze: "Hazy",
  Smoke: "Hazy",
}

const mapCondition = (text) => conditionMapper[text] || text || "Unknown"

const isValidKey = (key) => key && key.length > 5 && key !== "your_weatherapi_key_here" && key !== "your_openweathermap_api_key_here"

const fallbackWeather = () => ({
  condition: "Unknown",
  temperature: 30,
  feelsLike: 30,
  humidity: 60,
  windSpeed: 5,
})

export const fetchWeatherForDate = async (date) => {
  const dateKey = getDateKey(date)

  if (cache.has(dateKey)) {
    return cache.get(dateKey)
  }

  if (!isValidKey(weatherConfig.apiKey)) {
    const fb = fallbackWeather()
    cache.set(dateKey, fb)
    return fb
  }

  try {
    const location = `${encodeURIComponent(weatherConfig.city)}${weatherConfig.countryCode ? "," + weatherConfig.countryCode : ""}`
    const url = `https://api.weatherapi.com/v1/current.json?key=${weatherConfig.apiKey}&q=${location}&aqi=no`
    const response = await fetch(url)
    if (!response.ok) throw new Error(`WeatherAPI responded with ${response.status}`)
    const data = await response.json()

    const result = {
      condition: mapCondition(data.current?.condition?.text),
      temperature: Math.round(data.current?.temp_c ?? 30),
      feelsLike: Math.round(data.current?.feelslike_c ?? 30),
      humidity: data.current?.humidity ?? 60,
      windSpeed: data.current?.wind_kph ?? 5,
    }

    cache.set(dateKey, result)
    return result
  } catch (err) {
    console.warn("WeatherAPI fetch failed:", err.message)
    if (err.cause) console.warn("Cause:", err.cause)
    const fb = fallbackWeather()
    cache.set(dateKey, fb)
    return fb
  }
}
