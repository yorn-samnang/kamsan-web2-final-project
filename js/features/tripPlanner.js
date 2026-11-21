import { getStoredValue, setStoredValue } from '../state/store.js';
import { createElement, notify, selectAll } from '../utils/dom.js';
import { tripRecommendations } from '../data/tripRecommendations.js';

const STORAGE_KEY = 'kamsan:trip';
const LISTS = ['destinations', 'activities', 'foods'];
const TRIP_BUTTON_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="4.5" y="6.5" width="15" height="14" rx="2.5" />
    <path d="M9 6.5V4.75c0-.69.56-1.25 1.25-1.25h3.5c.69 0 1.25.56 1.25 1.25V6.5" />
    <path class="trip-icon-plus" d="M12 10v7m-3.5-3.5h7" />
    <path class="trip-icon-check" d="m8.6 13.6 2.3 2.2 4.5-4.7" />
  </svg>`;
const TRIP_SHORTCUT_ICON = `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="4.5" y="6.5" width="15" height="14" rx="2.5" />
    <path d="M9 6.5V4.75c0-.69.56-1.25 1.25-1.25h3.5c.69 0 1.25.56 1.25 1.25V6.5" />
    <path d="M9 13.5h6" />
  </svg>`;

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
    addButton.setAttribute('aria-pressed', String(isAdded));
    const label = isAdded
      ? `Remove ${addButton.dataset.tripName} from My Trip`
      : `Add ${addButton.dataset.tripName} to My Trip`;
    addButton.setAttribute('aria-label', label);
    addButton.title = label;
  });

  const count = LISTS.reduce((total, list) => total + trip[list].length, 0);
  const counter = document.querySelector('[data-trip-count]');
  if (counter) {
    counter.textContent = String(count);
    counter.hidden = count === 0;
    counter
      .closest('[data-trip-link]')
      .setAttribute('aria-label', `My Trip, ${count} ${count === 1 ? 'item' : 'items'}`);
  }
}

function bindAddButton(addButton, item) {
  addButton.innerHTML = TRIP_BUTTON_ICON;
  addButton.dataset.tripAdd = '';
  addButton.dataset.tripType = item.type;
  addButton.dataset.tripId = item.id;
  addButton.dataset.tripName = item.name;
  addButton.addEventListener('click', () => {
    try {
      const added = toggleItem(item);
      notify({
        title: added ? 'Added to My Trip' : 'Removed from My Trip',
        message: added ? `${item.name} is in your trip.` : `${item.name} was removed.`,
        state: added ? 'success' : 'info',
        duration: 3500,
      });
    } catch {
      notify({
        title: 'Trip not updated',
        message: 'Your changes could not be saved in this browser.',
        state: 'error',
      });
    }
  });
}

function toggleItem(item) {
  const listName = getTypeList(item.type);
  let added = false;
  updateTrip((trip) => {
    const wasAdded = trip[listName].some((saved) => saved.id === item.id);
    added = !wasAdded;
    return {
      ...trip,
      [listName]: wasAdded
        ? trip[listName].filter((saved) => saved.id !== item.id)
        : [...trip[listName], item],
    };
  });
  return added;
}

function createTripShortcut() {
  if (document.querySelector('[data-trip-link]')) return;

  const isInPages = window.location.pathname.includes('/pages/');
  const tripPlannerHref = isInPages ? 'trip-planner.html' : 'pages/trip-planner.html';

  const link = createElement('a', {
    className: 'trip-shortcut',
    attributes: {
      href: tripPlannerHref,
      'data-trip-link': '',
      'aria-label': 'My Trip, 0 items',
      title: 'My Trip',
    },
  });
  link.innerHTML = TRIP_SHORTCUT_ICON;
  const count = createElement('span', {
    className: 'trip-nav-count',
    dataset: { tripCount: '' },
    attributes: { 'aria-hidden': 'true' },
    text: '0',
  });
  count.hidden = true;
  link.append(count);
  if (window.location.pathname.endsWith('trip-planner.html')) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
  document.body.append(link);
}

export function initTripPlannerControls(root = document) {
  createTripShortcut();
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
        () => removeItem(listName, item.id, item.name),
        `Remove ${item.name}`
      )
    );
    row.append(title);
    if (detail) row.append(detail);
    row.append(controls);
    container.append(row);
  });
}

function removeItem(listName, id, name) {
  try {
    updateTrip((trip) => ({
      ...trip,
      [listName]: trip[listName].filter((item) => item.id !== id),
    }));
    notify({ title: 'Removed from My Trip', message: `${name} was removed.`, state: 'info' });
  } catch {
    notify({
      title: 'Trip not updated',
      message: 'Your changes could not be saved in this browser.',
      state: 'error',
    });
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
    document.querySelector('.trip-planner')?.classList.add('has-rendered');
    refreshAddButtons();
  } catch {
    showStatus('Your trip could not be loaded from this browser.', true);
  }
}

export function initTripPlannerPage() {
  renderPlanner();
  document.addEventListener('tripchange', renderPlanner);
}
