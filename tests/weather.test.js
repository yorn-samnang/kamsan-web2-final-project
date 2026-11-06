import { getWeatherDescription, initWeather } from '../js/features/weather.js';

const currentWeather = {
  destination: 'Phnom Penh',
  temperature: 31.2,
  temperatureUnit: '°C',
  humidity: 70,
  humidityUnit: '%',
  windSpeed: 12.4,
  windSpeedUnit: 'km/h',
  weatherCode: 2,
  observedAt: '2026-09-22T10:00',
};

describe('weather feature', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section data-weather data-destination="phnom-penh">
        <div data-weather-content></div>
      </section>
    `;
  });

  test('renders returned current conditions', async () => {
    const getWeather = async () => currentWeather;
    const weather = initWeather({ getWeather });

    await weather.load();

    expect(document.querySelector('.weather-card')).not.toBeNull();
    expect(document.body.textContent).toContain('Weather in Phnom Penh');
    expect(document.body.textContent).toContain('Partly cloudy');
    expect(document.body.textContent).toContain('31.2°C');
    weather.destroy();
  });

  test('renders an accessible error when the request fails', async () => {
    const weather = initWeather({ getWeather: async () => Promise.reject(new Error('Offline')) });

    await weather.load();

    expect(document.querySelector('[role="alert"]')?.textContent).toContain('Offline');
    weather.destroy();
  });

  test('maps Open-Meteo weather codes to readable labels', () => {
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
    expect(getWeatherDescription(999)).toBe('Unknown conditions');
  });
});
