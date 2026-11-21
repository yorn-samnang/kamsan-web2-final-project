import { jest } from '@jest/globals';
import { getStoredValue, setStoredValue } from '../js/state/store.js';
import { initTripPlannerControls, renderPlanner } from '../js/features/tripPlanner.js';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <nav class="site-nav"></nav>
    <section id="trip-destination-options">
      <article class="dest-card">
        <h3 class="dest-name">Phnom Penh</h3>
      </article>
    </section>
    <div id="trip-destinations"></div>
    <div id="trip-activities"></div>
    <div id="trip-food"></div>
    <div id="trip-suggestions"></div>
  `;
});

afterEach(() => {
  jest.useRealTimers();
});

test('adds a destination, shows suggestions, and adds a suggested activity', () => {
  initTripPlannerControls();
  document.querySelector('[data-trip-add]').click();

  const trip = getStoredValue('kamsan:trip', {});
  expect(trip.destinations.map((item) => item.name)).toEqual(['Phnom Penh']);
  expect(document.querySelector('[data-trip-count]').textContent).toBe('1');
  expect(document.querySelector('.site-nav [data-trip-link]')).toBeNull();
  expect(document.querySelector('.trip-shortcut').getAttribute('href')).toBe(
    'pages/trip-planner.html'
  );
  expect(document.querySelector('.trip-shortcut').getAttribute('aria-label')).toBe(
    'My Trip, 1 item'
  );
  expect(document.querySelector('.trip-destination-suggestions')).toBeNull();

  renderPlanner();
  expect(document.querySelector('#trip-suggestions').textContent).toContain('Royal Palace');
  expect(document.querySelector('#trip-suggestions img').getAttribute('src')).toBe(
    '../images/destinations/phnom-penh-royal-palace.png'
  );
  document.querySelector('#trip-suggestions .trip-add-button').click();

  expect(getStoredValue('kamsan:trip', {}).activities.map((item) => item.name)).toEqual([
    'Royal Palace',
  ]);
  expect(document.querySelector('.toast-region').textContent).toContain(
    'Royal Palace is in your trip.'
  );
  const savedButton = document.querySelector('[data-trip-id="activity:royal-palace"]');
  expect(savedButton.getAttribute('aria-pressed')).toBe('true');
  expect(savedButton.querySelector('.trip-icon-check')).not.toBeNull();
});

test('toggles a destination in and out of My Trip with matching notifications', () => {
  jest.useFakeTimers();
  initTripPlannerControls();

  const addButton = document.querySelector('[data-trip-add]');
  addButton.click();

  expect(addButton.disabled).toBe(false);
  expect(addButton.getAttribute('aria-pressed')).toBe('true');
  expect(addButton.getAttribute('aria-label')).toBe('Remove Phnom Penh from My Trip');
  expect(addButton.title).toBe('Remove Phnom Penh from My Trip');
  expect(addButton.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  expect(document.querySelector('[data-trip-status]')).toBeNull();
  expect(document.querySelector('.action-toast[data-state="success"] strong').textContent).toBe(
    'Added to My Trip'
  );

  addButton.click();
  expect(getStoredValue('kamsan:trip', {}).destinations).toHaveLength(0);
  expect(addButton.getAttribute('aria-pressed')).toBe('false');
  expect(addButton.getAttribute('aria-label')).toBe('Add Phnom Penh to My Trip');
  expect(document.querySelector('[data-trip-count]').hidden).toBe(true);
  expect(document.querySelector('.action-toast[data-state="info"] strong').textContent).toBe(
    'Removed from My Trip'
  );

  jest.advanceTimersByTime(3500);
  expect(document.querySelector('.toast')).toBeNull();
});

test('adds Phnom Penh from a destination page without showing recommendations there', () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    '<button data-trip-destination="Phnom Penh">Add to My Trip</button>'
  );
  initTripPlannerControls();

  document.querySelector('[data-trip-destination]').click();

  expect(document.querySelector('#destination-trip-suggestions')).toBeNull();
  expect(getStoredValue('kamsan:trip', {}).destinations.map((item) => item.name)).toEqual([
    'Phnom Penh',
  ]);
  expect(document.querySelector('.action-toast').textContent).toContain(
    'Phnom Penh is in your trip.'
  );
});

test('adds food from both food card styles using the shared trip button', () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <article class="food-photo-card"><h3>Fish Amok</h3></article>
      <article class="mini-food-card"><h3>Palm Juice</h3></article>
    `
  );
  initTripPlannerControls();

  const buttons = document.querySelectorAll(
    '.food-photo-card .trip-add-button, .mini-food-card .trip-add-button'
  );
  expect(buttons).toHaveLength(2);
  expect([...buttons].every((addButton) => addButton.classList.contains('trip-add-button'))).toBe(
    true
  );

  buttons.forEach((addButton) => addButton.click());
  expect(getStoredValue('kamsan:trip', {}).foods.map((item) => item.name)).toEqual([
    'Fish Amok',
    'Palm Juice',
  ]);
  expect(document.querySelector('.toast-region').textContent).toContain(
    'Fish Amok is in your trip.'
  );
  expect(document.querySelector('.toast-region').textContent).toContain(
    'Palm Juice is in your trip.'
  );
});

test('shows no reorder controls and removes planned destinations', () => {
  setStoredValue('kamsan:trip', {
    destinations: [
      { id: 'destination:kampot', name: 'Kampot' },
      { id: 'destination:kep', name: 'Kep' },
    ],
    activities: [],
    foods: [],
  });
  renderPlanner();

  expect(
    [...document.querySelectorAll('.trip-control-button')].map((control) => control.textContent)
  ).toEqual(['Remove', 'Remove']);
  expect(document.querySelector('[aria-label="Move Kep up"]')).toBeNull();
  expect(document.querySelector('[aria-label="Move Kep down"]')).toBeNull();

  document.querySelector('.trip-control-button[aria-label="Remove Kep"]').click();
  expect(getStoredValue('kamsan:trip', {}).destinations.map((item) => item.name)).toEqual([
    'Kampot',
  ]);
  expect(document.querySelector('.action-toast').textContent).toContain('Kep was removed.');
});
