import { createElement, renderError, renderLoading, select } from '../utils/dom.js';
import { CAMBODIAN_DESTINATIONS, getCurrentWeather } from '../services/weatherApi.js';

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
    text: `Updated: ${weather.observedAt.replace('T', ' ')} (destination local time)`,
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
  autoLoad = true,
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
  if (autoLoad) load();

  return {
    load,
    destroy() {
      requestId += 1;
      destinationControl?.removeEventListener('change', handleDestinationChange);
    },
  };
}

function createWeatherPanel() {
  const panel = createElement('section', {
    className: 'recommendation-quiz-panel destination-weather-panel',
    dataset: { weather: '' },
    attributes: {
      id: 'destination-weather',
      role: 'dialog',
      'aria-labelledby': 'destination-weather-title',
    },
  });
  panel.hidden = true;

  const header = createElement('div', { className: 'recommendation-quiz-header' });
  header.append(
    createElement('h2', {
      text: 'Current weather',
      attributes: { id: 'destination-weather-title' },
    }),
    createElement('button', {
      className: 'recommendation-quiz-close',
      text: 'Close',
      dataset: { weatherClose: '' },
      attributes: { type: 'button', 'aria-label': 'Close weather' },
    })
  );

  const control = createElement('div', { className: 'destination-weather-control' });
  const destination = createElement('select', {
    dataset: { weatherDestination: '' },
    attributes: { id: 'weather-destination' },
  });
  Object.entries(CAMBODIAN_DESTINATIONS).forEach(([id, place]) => {
    destination.append(createElement('option', { text: place.name, attributes: { value: id } }));
  });
  control.append(
    createElement('label', { text: 'Destination', attributes: { for: 'weather-destination' } }),
    destination
  );

  const credit = createElement('p', { className: 'destination-weather-credit' });
  credit.append('Weather data from ');
  credit.append(
    createElement('a', { text: 'Open-Meteo', attributes: { href: 'https://open-meteo.com/' } })
  );
  credit.append('.');

  panel.append(
    header,
    createElement('p', {
      className: 'recommendation-quiz-intro',
      text: 'Choose a destination to see its current conditions before you go.',
    }),
    control,
    createElement('div', {
      className: 'destination-weather-content',
      dataset: { weatherContent: '' },
      attributes: { 'aria-live': 'polite' },
    }),
    credit
  );
  return panel;
}

/** Shows destination weather in a fixed panel beside the weather shortcut. */
export function initWeatherPanel({ root = document, getWeather = getCurrentWeather } = {}) {
  if (select('[data-weather-trigger]', root)) return { destroy() {} };
  const panel = createWeatherPanel();

  const trigger = createElement('button', {
    className: 'trip-shortcut weather-shortcut',
    dataset: { weatherTrigger: '' },
    attributes: {
      type: 'button',
      'aria-label': 'Check destination weather',
      'aria-expanded': 'false',
      'aria-controls': panel.id,
    },
  });
  trigger.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m-6.4.6 1.4 1.4M3 12h2m1-5a6 6 0 0 1 11 3"/><path d="M8 18h11a3 3 0 0 0 .1-6 5 5 0 0 0-9.7 1.5A2.3 2.3 0 0 0 8 18Z"/></svg>';
  (root.body || root).append(trigger);
  (root.body || root).append(panel);

  const weather = initWeather({ root, getWeather, autoLoad: false });
  const closeButton = select('[data-weather-close]', panel);

  function close({ restoreFocus = true } = {}) {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function toggle() {
    if (!panel.hidden) {
      close();
      return;
    }
    const quizTrigger = select('[data-recommendation-quiz-trigger]', root);
    if (quizTrigger?.getAttribute('aria-expanded') === 'true') quizTrigger.click();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    panel.scrollTop = 0;
    weather.load();
    closeButton?.focus();
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && !panel.hidden) close();
  }

  function handleQuizOpen() {
    if (!panel.hidden) close({ restoreFocus: false });
  }

  trigger.addEventListener('click', toggle);
  closeButton?.addEventListener('click', close);
  root.addEventListener('keydown', handleKeydown);
  select('[data-recommendation-quiz-trigger]', root)?.addEventListener('click', handleQuizOpen);

  return {
    destroy() {
      weather.destroy();
      trigger.removeEventListener('click', toggle);
      closeButton?.removeEventListener('click', close);
      root.removeEventListener('keydown', handleKeydown);
      select('[data-recommendation-quiz-trigger]', root)?.removeEventListener(
        'click',
        handleQuizOpen
      );
      trigger.remove();
      panel.remove();
    },
  };
}
