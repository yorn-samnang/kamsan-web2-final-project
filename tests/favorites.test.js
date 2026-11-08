import { initFavorites, initFavoritesPage } from '../js/features/favorites.js';
import { jest } from '@jest/globals';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <article class="dest-card">
      <a class="dest-card-link" href="destination-phnom-penh.html">
        <img src="images/destinations/royal-palace.png" alt="Royal Palace" />
        <h3 class="dest-name">Phnom Penh</h3>
        <p class="dest-tagline">Capital city</p>
      </a>
      <button class="favorite-button" type="button" aria-label="Add Phnom Penh to favorites" aria-pressed="false"><svg aria-hidden="true"></svg></button>
    </article>
    <p id="favorites-status"></p><div id="favorites-list"></div>
    <div id="favorite-toast" hidden></div>
  `;
  const sourceHtml = document.body.innerHTML;
  globalThis.fetch = async () => ({
    ok: true,
    text: async () => sourceHtml,
  });
});

test('saves a destination and shows the same card with a delete icon', async () => {
  initFavorites();
  expect(document.querySelectorAll('.favorite-button')).toHaveLength(1);
  const heart = document.querySelector('.favorite-button');
  heart.click();
  expect(heart.getAttribute('aria-pressed')).toBe('true');
  expect(document.querySelector('#favorite-toast').textContent).toBe(
    'Phnom Penh added to favorites!'
  );
  expect(document.querySelector('#favorite-toast').hidden).toBe(false);

  await initFavoritesPage();
  expect(document.querySelector('#favorites-list').textContent).toContain('Phnom Penh');
  expect(document.querySelector('#favorites-list .dest-card-link')).not.toBeNull();
  expect(document.querySelector('#favorites-list .favorite-button')).toBeNull();

  document.querySelector('.favorite-delete').click();
  expect(document.querySelector('#favorites-list').children).toHaveLength(0);
  expect(document.querySelector('#favorite-toast').textContent).toBe(
    'Phnom Penh removed from favorites!'
  );
});

test('shows a notification when the card heart removes a favorite', () => {
  initFavorites();
  const heart = document.querySelector('.favorite-button');
  heart.click();
  heart.click();
  expect(heart.getAttribute('aria-pressed')).toBe('false');
  expect(document.querySelector('#favorite-toast').textContent).toBe(
    'Phnom Penh removed from favorites!'
  );
});

test('shows a failure notification without filling the heart when storage fails', () => {
  initFavorites();
  const heart = document.querySelector('.favorite-button');
  const write = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });

  heart.click();
  expect(heart.getAttribute('aria-pressed')).toBe('false');
  expect(document.querySelector('#favorite-toast').textContent).toBe(
    'Favorites could not be saved in this browser.'
  );
  expect(document.querySelector('#favorite-toast').hidden).toBe(false);
  write.mockRestore();
});
