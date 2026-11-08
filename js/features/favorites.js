import { getStoredValue, setStoredValue } from '../state/store.js';
import { initCardRatings } from './touristReviews.js';

const KEY = 'kamsan:favorites';
let toastTimer;

function showToast(message, tone = 'success') {
  const toast = document.querySelector('#favorite-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

function readFavorites() {
  const saved = getStoredValue(KEY, []);
  return Array.isArray(saved) ? saved.filter((item) => item && typeof item.name === 'string') : [];
}

function makeButton(name, isSaved) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'favorite-button';
  button.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  setButtonState(button, name, isSaved);
  return button;
}

function setButtonState(button, name, isSaved) {
  button.setAttribute(
    'aria-label',
    `${isSaved ? 'Remove' : 'Add'} ${name} ${isSaved ? 'from' : 'to'} favorites`
  );
  button.setAttribute('aria-pressed', String(isSaved));
}

export function initFavorites() {
  const cards = document.querySelectorAll('.dest-card');
  let favorites;
  try {
    favorites = readFavorites();
  } catch {
    favorites = [];
  }

  cards.forEach((card) => {
    const name = card.querySelector('.dest-name').textContent.trim();
    const image = card.querySelector('img');
    const item = {
      name,
      image: image.getAttribute('src'),
      alt: image.alt,
      tagline: card.querySelector('.dest-tagline').textContent.trim(),
      href: card.querySelector('.dest-card-link').getAttribute('href'),
    };
    const isSaved = favorites.some((favorite) => favorite.name === name);
    const button = card.querySelector('.favorite-button') || makeButton(name, isSaved);
    setButtonState(button, name, isSaved);
    if (!button.isConnected) card.append(button);

    button.addEventListener('click', () => {
      try {
        const current = readFavorites();
        const isSaved = current.some((favorite) => favorite.name === name);
        setStoredValue(
          KEY,
          isSaved ? current.filter((favorite) => favorite.name !== name) : [...current, item]
        );
        setButtonState(button, name, !isSaved);
        showToast(`${name} ${isSaved ? 'removed from' : 'added to'} favorites!`);
      } catch {
        showToast('Favorites could not be saved in this browser.', 'error');
      }
    });
  });
}

export async function initFavoritesPage() {
  const list = document.querySelector('#favorites-list');
  const status = document.querySelector('#favorites-status');
  status.textContent = 'Loading favorites...';

  let sourceCards;
  try {
    const response = await fetch('destinations.html');
    if (!response.ok) throw new Error('Could not load destinations');
    const sourcePage = new window.DOMParser().parseFromString(await response.text(), 'text/html');
    sourceCards = [...sourcePage.querySelectorAll('.dest-card')];
  } catch {
    status.textContent = 'Favorite cards could not be loaded. Please try again.';
    return;
  }

  function render() {
    let favorites;
    try {
      favorites = readFavorites();
    } catch {
      status.textContent = 'Favorites could not be loaded in this browser.';
      return;
    }

    list.replaceChildren();
    status.textContent = favorites.length
      ? `${favorites.length} saved destination${favorites.length === 1 ? '' : 's'}`
      : 'No favorites yet. Browse destinations and tap a heart to save one.';

    favorites.forEach((item) => {
      const source = sourceCards.find(
        (card) => card.querySelector('.dest-name')?.textContent.trim() === item.name
      );
      if (!source) return;
      const card = source.cloneNode(true);
      card.classList.remove('reveal');
      card.querySelector('.favorite-button')?.remove();
      const link = card.querySelector('.dest-card-link');
      if (link.getAttribute('href') !== 'destination-phnom-penh.html') {
        link.classList.add('is-view-only');
        link.setAttribute('aria-disabled', 'true');
        link.addEventListener('click', (event) => event.preventDefault());
      }
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'favorite-delete';
      remove.setAttribute('aria-label', `Remove ${item.name} from favorites`);
      remove.innerHTML =
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';
      remove.addEventListener('click', () => {
        try {
          setStoredValue(
            KEY,
            readFavorites().filter((favorite) => favorite.name !== item.name)
          );
          render();
          showToast(`${item.name} removed from favorites!`);
        } catch {
          status.textContent = 'Favorites could not be saved in this browser.';
        }
      });
      card.append(remove);
      list.append(card);
    });
    initCardRatings(list);
  }

  render();
}
