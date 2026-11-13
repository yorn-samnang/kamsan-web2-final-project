import { getStoredValue, setStoredValue } from '../state/store.js';
import { createElement, selectAll } from '../utils/dom.js';
import { tripRecommendations } from '../data/tripRecommendations.js';

const STORAGE_KEY = 'kamsan:trip';
const LISTS = ['destinations', 'activities', 'foods'];

function emptyTrip() {
  return { destinations: [], activities: [], foods: [] };
}

function readTrip() {
  const saved = getStoredValue(STORAGE_KEY, emptyTrip());
  if (!saved || typeof saved !== 'object') return emptyTrip();
  return Object.fromEntries(
    LISTS.map((list) => [
      list,
      Array.isArray(saved[list])
        ? saved[list].filter(
            (item) => item && typeof item.id === 'string' && typeof item.name === 'string'
          )
        : [],
    ])
  );
}

function itemId(type, name) {
  return `${type}:${name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}`;
}

function updateTrip(update) {
  const trip = readTrip();
  const next = update(trip);
  setStoredValue(STORAGE_KEY, next);
  document.dispatchEvent(new window.CustomEvent('tripchange'));
  return next;
}

function showStatus(message, isError = false) {
  let status = document.querySelector('[data-trip-status]');
  if (!status) {
    status = createElement('p', {
      dataset: { tripStatus: '' },
      attributes: { role: 'status', 'aria-live': 'polite' },
    });
    document.body.append(status);
  }
  status.textContent = message;
  status.dataset.error = String(isError);
}

function button(text, className, onClick, label) {
  const element = createElement('button', {
    className,
    text,
    attributes: { type: 'button', 'aria-label': label || text },
  });
  element.addEventListener('click', onClick);
  return element;
}

function getCardItem(card, type) {
  const heading = card.querySelector(type === 'destination' ? '.dest-name' : 'h3');
  if (!heading) return null;

  const name = heading.textContent.trim();
  const image = card.querySelector('img');
  const location = card.closest('section[id]')?.querySelector('h2')?.textContent.trim() || '';
  return {
    id: itemId(type, name),
    type,
    name,
    location,
    image: image?.getAttribute('src') || '',
    href: card.querySelector('a[href]')?.getAttribute('href') || '',
  };
}

function getTypeList(type) {
  return type === 'destination' ? 'destinations' : type === 'activity' ? 'activities' : 'foods';
}

function refreshAddButtons(root = document) {
  let trip;
  try {
    trip = readTrip();
  } catch {
    showStatus('Your trip could not be loaded from this browser.', true);
    return;
  }

  selectAll('[data-trip-add]', root).forEach((addButton) => {
    const list = trip[getTypeList(addButton.dataset.tripType)];
    const isAdded = list.some((item) => item.id === addButton.dataset.tripId);
    addButton.textContent = isAdded ? 'Added to My Trip' : 'Add to My Trip';
    addButton.setAttribute('aria-pressed', String(isAdded));
  });

  const count = LISTS.reduce((total, list) => total + trip[list].length, 0);
  const counter = document.querySelector('[data-trip-count]');
  if (counter) counter.textContent = String(count);
}

function bindAddButton(addButton, item) {
  addButton.dataset.tripAdd = '';
  addButton.dataset.tripType = item.type;
  addButton.dataset.tripId = item.id;
  addButton.addEventListener('click', () => {
    try {
      addItem(item);
      showStatus(`${item.name} added to My Trip.`);
    } catch {
      showStatus('Your trip could not be saved in this browser.', true);
    }
  });
}

function addItem(item) {
  const listName = getTypeList(item.type);
  updateTrip((trip) => ({
    ...trip,
    [listName]: trip[listName].some((saved) => saved.id === item.id)
      ? trip[listName]
      : [...trip[listName], item],
  }));
}

function createNavLink() {
  const nav = document.querySelector('.site-nav');
  if (!nav || nav.querySelector('[data-trip-link]')) return;

  const link = createElement('a', {
    attributes: { href: 'trip-planner.html', 'data-trip-link': '' },
    text: 'My Trip ',
  });
  const count = createElement('span', {
    className: 'trip-nav-count',
    dataset: { tripCount: '' },
    attributes: { 'aria-label': 'items in your trip' },
    text: '0',
  });
  link.append(count);
  if (window.location.pathname.endsWith('trip-planner.html')) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
  nav.append(link);
}

export function initTripPlannerControls(root = document) {
  createNavLink();
  selectAll('[data-trip-destination]', root).forEach((addButton) => {
    const name = addButton.dataset.tripDestination.trim();
    const item = {
      id: itemId('destination', name),
      type: 'destination',
      name,
      location: '',
      image: '',
      href: '',
    };
    if (addButton.dataset.tripAdd) return;
    bindAddButton(addButton, item);
  });

  const cardTypes = [
    ['.dest-card', 'destination'],
    ['.food-photo-card, .mini-food-card', 'food'],
    ['.place-card', 'activity'],
  ];

  cardTypes.forEach(([selector, type]) => {
    selectAll(selector, root).forEach((card) => {
      if (card.querySelector('[data-trip-add]')) return;
      const item = getCardItem(card, type);
      if (!item) return;

      const addButton = createElement('button', {
        className: 'trip-add-button',
        text: 'Add to My Trip',
        attributes: { type: 'button', 'aria-label': `Add ${item.name} to My Trip` },
      });
      bindAddButton(addButton, item);
      card.append(addButton);
    });
  });

  refreshAddButtons(root);
  document.addEventListener('tripchange', () => refreshAddButtons(root));
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) refreshAddButtons(root);
  });
}

function renderList(container, listName, trip) {
  container.replaceChildren();
  const items = trip[listName];
  if (!items.length) {
    container.append(createElement('p', { text: 'Nothing added yet.' }));
    return;
  }

  items.forEach((item) => {
    const row = createElement('article', { className: 'trip-item' });
    const title = createElement('h3', { text: item.name });
    const detail = item.location ? createElement('p', { text: item.location }) : null;
    const controls = createElement('div', { className: 'trip-item-controls' });
    controls.append(
      button(
        'Remove',
        'trip-control-button',
        () => removeItem(listName, item.id),
        `Remove ${item.name}`
      )
    );
    row.append(title);
    if (detail) row.append(detail);
    row.append(controls);
    container.append(row);
  });
}

function removeItem(listName, id) {
  try {
    updateTrip((trip) => ({
      ...trip,
      [listName]: trip[listName].filter((item) => item.id !== id),
    }));
  } catch {
    showStatus('Your trip could not be updated in this browser.', true);
  }
}

function renderSuggestions(container, destination, includeImages = false) {
  const suggestions = tripRecommendations[destination.id];
  if (!suggestions) return;

  ['activities', 'foods'].forEach((listName) => {
    const type = listName === 'activities' ? 'activity' : 'food';
    suggestions[listName].forEach((suggestion) => {
      const { name, image } = typeof suggestion === 'string' ? { name: suggestion } : suggestion;
      const item = { id: itemId(type, name), type, name, location: destination.name };
      const card = createElement('article', { className: 'trip-suggestion' });
      if (includeImages && image) {
        card.append(
          createElement('img', {
            attributes: { src: image, alt: name, loading: 'lazy' },
          })
        );
      }
      card.append(createElement('h4', { text: name }));
      const addButton = createElement('button', {
        className: 'trip-add-button',
        text: 'Add to My Trip',
        attributes: { type: 'button', 'aria-label': `Add ${name} to My Trip` },
      });
      bindAddButton(addButton, item);
      card.append(addButton);
      container.append(card);
    });
  });
}

export function renderPlanner() {
  const destinationsContainer = document.querySelector('#trip-destinations');
  const activitiesContainer = document.querySelector('#trip-activities');
  const foodsContainer = document.querySelector('#trip-food');
  const suggestionsContainer = document.querySelector('#trip-suggestions');
  if (!destinationsContainer || !activitiesContainer || !foodsContainer) return;

  try {
    const trip = readTrip();
    renderList(destinationsContainer, 'destinations', trip);
    renderList(activitiesContainer, 'activities', trip);
    renderList(foodsContainer, 'foods', trip);
    if (suggestionsContainer) {
      suggestionsContainer.replaceChildren();
      trip.destinations.forEach((destination) => {
        const section = createElement('section', { className: 'trip-suggestion-group' });
        section.append(createElement('h3', { text: `Suggestions for ${destination.name}` }));
        const suggestions = tripRecommendations[destination.id];
        if (suggestions?.activities.length || suggestions?.foods.length) {
          renderSuggestions(section, destination, true);
        } else {
          section.append(
            createElement('p', { text: 'No recommendations yet for this destination.' })
          );
        }
        suggestionsContainer.append(section);
      });
      if (!trip.destinations.length) {
        suggestionsContainer.append(
          createElement('p', { text: 'Add a destination to see related food and activity ideas.' })
        );
      }
    }
    refreshAddButtons();
  } catch {
    showStatus('Your trip could not be loaded from this browser.', true);
  }
}

export function initTripPlannerPage() {
  renderPlanner();
  document.addEventListener('tripchange', renderPlanner);
}
