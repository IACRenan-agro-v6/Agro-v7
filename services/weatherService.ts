import { UserLocation, WeatherInfo } from '../types';

export const fetchLocalWeather = async (location: UserLocation): Promise<WeatherInfo | null> => {
  try {
    // Timeout helper to prevent hanging requests
    const fetchWithTimeout = async (url: string, timeout = 5000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    // 1. Fetch Weather Data (Open-Meteo)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh`;
    
    let weatherData: any = null;
    try {
      const weatherRes = await fetchWithTimeout(weatherUrl);
      if (weatherRes.ok) {
        weatherData = await weatherRes.json();
      } else {
        console.warn("Weather API returned non-200 status");
      }
    } catch (e) {
      console.warn("Failed to fetch weather data:", e);
    }

    // 2. Fetch Location Name (BigDataCloud)
    // Using reverse-geocode-client which is free for client-side requests
    const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=pt`;
    
    let locationName = 'Localização Atual';
    try {
      const geoRes = await fetchWithTimeout(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        // Priority: Locality (Bairro) -> City -> PrincipalSubdivision -> 'Local Desconhecido'
        locationName = geoData.locality || geoData.city || geoData.principalSubdivision || 'Área Rural';
      }
    } catch (e) {
      console.warn("Failed to fetch location name:", e);
    }

    if (!weatherData) {
      return {
        locationName: locationName,
        temperature: 25,
        humidity: 60,
        windSpeed: 10,
        loading: false
      };
    }

    return {
      locationName: locationName,
      temperature: weatherData.current?.temperature_2m || 25,
      humidity: weatherData.current?.relative_humidity_2m || 60,
      windSpeed: weatherData.current?.wind_speed_10m || 10,
      loading: false
    };

  } catch (error) {
    console.error("Critical error in weather service:", error);
    return null;
  }
};