
import { useState, useEffect } from 'react';
import { UserLocation, WeatherInfo } from '../types';
import { fetchLocalWeather } from '../services/weatherService';

export const useLocationWeather = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          const weather = await fetchLocalWeather(loc);
          setWeatherInfo(weather);
        },
        async (error) => {
          console.warn("Geolocation denied or failed, using fallback (Rio de Janeiro):", error);
          const fallbackLoc = { lat: -22.9068, lng: -43.1729 };
          setUserLocation(fallbackLoc);
          const weather = await fetchLocalWeather(fallbackLoc);
          setWeatherInfo(weather);
        },
        { timeout: 10000 }
      );
    } else {
      const fallbackLoc = { lat: -22.9068, lng: -43.1729 };
      setUserLocation(fallbackLoc);
      fetchLocalWeather(fallbackLoc).then(setWeatherInfo);
    }
  }, []);

  return { userLocation, weatherInfo };
};
