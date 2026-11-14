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

test('adds a destination, shows suggestions, and adds a suggested activity', () => {
  initTripPlannerControls();
  document.querySelector('[data-trip-add]').click();

  const trip = getStoredValue('kamsan:trip', {});
  expect(trip.destinations.map((item) => item.name)).toEqual(['Phnom Penh']);
  expect(document.querySelector('[data-trip-count]').textContent).toBe('1');
  expect(document.querySelector('.trip-destination-suggestions')).toBeNull();

  renderPlanner();
  expect(document.querySelector('#trip-suggestions').textContent).toContain('Royal Palace');
  expect(document.querySelector('#trip-suggestions img').getAttribute('src')).toBe(
    'images/destinations/phnom-penh-royal-palace.png'
  );
  document.querySelector('#trip-suggestions .trip-add-button').click();

  expect(getStoredValue('kamsan:trip', {}).activities.map((item) => item.name)).toEqual([
    'Royal Palace',
  ]);
  expect(document.querySelector('[data-trip-id="activity:royal-palace"]').textContent).toBe(
    'Added to My Trip'
  );
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
});
