import { createElement, renderError, renderLoading, select } from '../utils/dom.js';
import { getCurrentWeather } from '../services/weatherApi.js';

const WEATHER_DESCRIPTIONS = new Map([
  [[0], 'Clear sky'],
  [[1], 'Mainly clear'],
  [[2], 'Partly cloudy'],
  [[3], 'Overcast'],
  [[45, 48], 'Foggy'],
  [[51, 53, 55], 'Drizzle'],
  [[56, 57], 'Freezing drizzle'],
  [[61, 63, 65], 'Rain'],
  [[66, 67], 'Freezing rain'],
  [[71, 73, 75, 77], 'Snow'],
  [[80, 81, 82], 'Rain showers'],
  [[85, 86], 'Snow showers'],
  [[95], 'Thunderstorm'],
  [[96, 99], 'Thunderstorm with hail'],
]);

export function getWeatherDescription(code) {
  return (
    Array.from(WEATHER_DESCRIPTIONS.entries()).find(([codes]) => codes.includes(code))?.[1] ||
    'Unknown conditions'
  );
}

function createWeatherCard(weather) {
  const details = [
    ['Temperature', `${weather.temperature}${weather.temperatureUnit}`],
    ['Humidity', `${weather.humidity}${weather.humidityUnit}`],
    ['Wind', `${weather.windSpeed} ${weather.windSpeedUnit}`],
  ];
  const card = createElement('article', { className: 'weather-card' });
  const heading = createElement('h3', { text: `Weather in ${weather.destination}` });
  const condition = createElement('p', {
    className: 'weather-condition',
    text: getWeatherDescription(weather.weatherCode),
  });
  const list = createElement('dl', { className: 'weather-details' });

  details.forEach(([label, value]) => {
    list.append(createElement('dt', { text: label }), createElement('dd', { text: value }));
  });

  const updated = createElement('p', {
    className: 'weather-updated',
    text: `Updated: ${new Date(weather.observedAt).toLocaleString()}`,
  });
  card.append(heading, condition, list, updated);
  return card;
}

/**
 * Fetches and displays current Open-Meteo conditions for a destination.
 *
 * Expected markup: a container with `data-weather`, an optional select or button
 * with `data-weather-destination`, and an optional child `data-weather-content`.
 * If no container is present this is a safe no-op, so it can be imported by shared
 * page controllers.
 */
export function initWeather({
  root = document,
  containerSelector = '[data-weather]',
  destinationSelector = '[data-weather-destination]',
  contentSelector = '[data-weather-content]',
  getWeather = getCurrentWeather,
} = {}) {
  const container = select(containerSelector, root);
  if (!container) return { load: async () => null, destroy() {} };

  const destinationControl =
    select(destinationSelector, container) || select(destinationSelector, root);
  let content = select(contentSelector, container);
  if (!content) {
    content = createElement('div', {
      dataset: { weatherContent: '' },
      attributes: { 'aria-live': 'polite' },
    });
    container.append(content);
  }

  let requestId = 0;
  const load = async (
    destinationId = destinationControl?.value || container.dataset.destination
  ) => {
    if (!destinationId) {
      renderError(content, 'Choose a destination to see its weather.');
      return null;
    }

    const currentRequest = ++requestId;
    renderLoading(content, 'Loading current weather…');
    try {
      const weather = await getWeather(destinationId);
      if (currentRequest !== requestId) return null;
      content.replaceChildren(createWeatherCard(weather));
      content.removeAttribute('aria-busy');
      return weather;
    } catch (error) {
      if (currentRequest !== requestId) return null;
      renderError(content, error.message || 'Unable to load weather. Please try again.');
      return null;
    }
  };

  const handleDestinationChange = (event) => load(event.currentTarget.value);
  destinationControl?.addEventListener('change', handleDestinationChange);
  load();

  return {
    load,
    destroy() {
      requestId += 1;
      destinationControl?.removeEventListener('change', handleDestinationChange);
    },
  };
}
