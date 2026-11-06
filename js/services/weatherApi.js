import { request } from './apiClient.js';

const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const CAMBODIAN_DESTINATIONS = Object.freeze({
  'phnom-penh': { name: 'Phnom Penh', latitude: 11.5564, longitude: 104.9282 },
  'siem-reap': { name: 'Siem Reap', latitude: 13.3618, longitude: 103.8606 },
  'preah-sihanouk': { name: 'Preah Sihanouk', latitude: 10.6093, longitude: 103.5296 },
  'kampong-cham': { name: 'Kampong Cham', latitude: 11.9934, longitude: 105.4635 },
  takeo: { name: 'Takéo', latitude: 10.9908, longitude: 104.785 },
  kampot: { name: 'Kampot', latitude: 10.6104, longitude: 104.1814 },
  'koh-rong': { name: 'Koh Rong', latitude: 10.7167, longitude: 103.2333 },
  kratie: { name: 'Kratié', latitude: 12.4881, longitude: 106.0188 },
  'kampong-thom': { name: 'Kampong Thom', latitude: 12.7111, longitude: 104.8887 },
  kandal: { name: 'Kandal', latitude: 11.2237, longitude: 105.1259 },
  'prey-veng': { name: 'Prey Veng', latitude: 11.4868, longitude: 105.3253 },
  'svay-rieng': { name: 'Svay Rieng', latitude: 11.0878, longitude: 105.7994 },
  pursat: { name: 'Pursat', latitude: 12.5388, longitude: 103.9192 },
  'kampong-speu': { name: 'Kampong Speu', latitude: 11.4533, longitude: 104.5208 },
  'kampong-chhnang': { name: 'Kampong Chhnang', latitude: 12.25, longitude: 104.6667 },
  'banteay-meanchey': { name: 'Banteay Meanchey', latitude: 13.7532, longitude: 102.9896 },
  'koh-kong': { name: 'Koh Kong', latitude: 11.6153, longitude: 102.9838 },
  mondulkiri: { name: 'Mondulkiri', latitude: 12.7879, longitude: 107.1012 },
  ratanakiri: { name: 'Ratanakiri', latitude: 13.8577, longitude: 107.1012 },
  'steung-treng': { name: 'Steung Treng', latitude: 13.5259, longitude: 105.9683 },
  kep: { name: 'Kep', latitude: 10.5361, longitude: 104.3559 },
  pailin: { name: 'Pailin', latitude: 12.849, longitude: 102.6093 },
  'oddar-meanchey': { name: 'Oddar Meanchey', latitude: 14.161, longitude: 103.8216 },
  'preah-vihear': { name: 'Preah Vihear', latitude: 14.0086, longitude: 104.8455 },
  'tbong-khmum': { name: 'Tbong Khmum', latitude: 11.8891, longitude: 105.876 },
});

function getDestination(destinationId) {
  const destination = CAMBODIAN_DESTINATIONS[destinationId];

  if (!destination) {
    throw new Error(`Unsupported destination: ${destinationId}.`);
  }

  return destination;
}

/**
 * Gets current weather for one of the supported Cambodian destinations.
 * @param {string} destinationId A key from CAMBODIAN_DESTINATIONS.
 */
export async function getCurrentWeather(destinationId) {
  const destination = getDestination(destinationId);
  const parameters = new URLSearchParams({
    latitude: destination.latitude,
    longitude: destination.longitude,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    timezone: 'auto',
  });
  const data = await request(`${WEATHER_API_URL}?${parameters}`);

  if (!data?.current || !data?.current_units) {
    throw new Error('Weather data is unavailable for this destination.');
  }

  return {
    destinationId,
    destination: destination.name,
    temperature: data.current.temperature_2m,
    temperatureUnit: data.current_units.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    humidityUnit: data.current_units.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windSpeedUnit: data.current_units.wind_speed_10m,
    weatherCode: data.current.weather_code,
    observedAt: data.current.time,
    timezone: data.timezone,
  };
}
