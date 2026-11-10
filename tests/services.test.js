import { jest } from '@jest/globals';
import { getCurrentWeather } from '../js/services/weatherApi.js';
import { createReview, deleteReview, getReviews, updateReview } from '../js/services/reviewApi.js';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    headers: { get: () => 'application/json' },
    json: async () => body,
  };
}

describe('weather service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test('normalizes Open-Meteo weather data for Phnom Penh', async () => {
    global.fetch.mockResolvedValue(
      jsonResponse({
        timezone: 'Asia/Phnom_Penh',
        current_units: {
          temperature_2m: '\u00b0C',
          relative_humidity_2m: '%',
          wind_speed_10m: 'km/h',
        },
        current: {
          temperature_2m: 31.2,
          relative_humidity_2m: 70,
          wind_speed_10m: 12.4,
          weather_code: 2,
          time: '2026-09-22T10:00',
        },
      })
    );

    await expect(getCurrentWeather('phnom-penh')).resolves.toMatchObject({
      destination: 'Phnom Penh',
      temperature: 31.2,
      humidity: 70,
      windSpeed: 12.4,
    });
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('latitude=11.5625'), {});
  });

  test('rejects an unsupported destination before making a request', async () => {
    await expect(getCurrentWeather('unknown-destination')).rejects.toThrow(
      'Unsupported destination'
    );
  });
});

describe('review service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  test('uses the appropriate JSONPlaceholder CRUD requests', async () => {
    const fetchMock = global.fetch.mockResolvedValue(jsonResponse({ id: 1 }));
    const review = { title: 'Temple visit', body: 'Wonderful day', userId: 1 };

    await getReviews({ limit: 3 });
    await createReview(review);
    await updateReview(1, review);
    await expect(deleteReview(1)).resolves.toEqual({ id: 1, deleted: true });

    expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method])).toEqual([
      ['https://jsonplaceholder.typicode.com/posts?_limit=3', undefined],
      ['https://jsonplaceholder.typicode.com/posts', 'POST'],
      ['https://jsonplaceholder.typicode.com/posts/1', 'PUT'],
      ['https://jsonplaceholder.typicode.com/posts/1', 'DELETE'],
    ]);
  });
});
