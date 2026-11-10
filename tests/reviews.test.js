import { jest } from '@jest/globals';
import { initCardRatings, initDetailRating, initReviews } from '../js/features/touristReviews.js';

function response(body) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'application/json' },
    json: async () => body,
  };
}

function nextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('tourist reviews', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <section data-reviews>
        <form id="review-form">
          <input name="name">
          <select name="destination"><option value="">Choose</option><option>Kampot</option></select>
          <select name="rating"><option value="">Choose</option><option value="5">5</option></select>
          <textarea name="comment"></textarea>
          <button type="submit">Post review</button>
          <button type="button" data-cancel-edit hidden>Cancel edit</button>
        </form>
        <p data-review-status></p>
        <span data-review-count></span>
        <div data-review-list></div>
      </section>
    `;
    document.querySelector('form').scrollIntoView = () => {};
    window.confirm = jest.fn(() => true);
    global.fetch = jest.fn(async (_url, options = {}) => {
      if (!options.method) return response([{ id: 1 }, { id: 2 }, { id: 3 }]);
      if (options.method === 'POST') return response({ id: 101 });
      return response({});
    });
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  test('shows readable sample reviews and counts them', async () => {
    initReviews();
    await nextTick();

    expect(document.querySelector('[data-review-count]').textContent).toBe('3 reviews');
    expect(document.querySelector('[data-review-list]').textContent).toContain(
      'Angkor Wat at sunrise'
    );
    expect(global.fetch.mock.calls[0][0]).toContain('/posts?_limit=3');
  });

  test('shows a destination rating on its card', () => {
    document.body.innerHTML = `
      <article class="dest-card"><div class="dest-photo-wrap"><span class="dest-rating">Fallback</span></div><h3 class="dest-name">Phnom Penh</h3></article>
      <article class="dest-card"><div class="dest-photo-wrap"><span class="dest-rating">Fallback</span></div><h3 class="dest-name">Kep</h3></article>
    `;
    initCardRatings();
    const badges = document.querySelectorAll('.dest-rating');
    expect(badges).toHaveLength(2);
    expect(badges[0].querySelector('.dest-rating-stars').textContent).toBe('★★★★☆');
    expect(badges[1].querySelector('.dest-rating-stars').textContent).toBe('☆☆☆☆☆');
    expect(document.querySelector('.dest-card .dest-rating-tip')).toBeNull();
    expect(badges[0].hasAttribute('tabindex')).toBe(false);
  });

  test('ignores malformed saved reviews without stopping card setup', () => {
    localStorage.setItem('kamsan:reviews', '[null]');
    document.body.innerHTML = `
      <article class="dest-card"><div class="dest-photo-wrap"></div><h3 class="dest-name">Phnom Penh</h3></article>
    `;
    expect(() => initCardRatings()).not.toThrow();
    expect(document.querySelector('.dest-rating-stars').textContent).toBe('☆☆☆☆☆');
  });

  test('replaces the detail hero fallback rating', () => {
    document.body.innerHTML = `
      <section class="detail-hero"><span class="dest-rating dest-rating--detail">Fallback</span></section>
      <section data-reviews data-destination="Phnom Penh"></section>
    `;
    initDetailRating();
    const badges = document.querySelectorAll('.dest-rating--detail');
    expect(badges).toHaveLength(1);
    expect(badges[0].querySelector('.dest-rating-stars').textContent).toBe('★★★★☆');
  });

  test('opens rating details on the destination detail hero only', async () => {
    document.body.innerHTML = `
      <article class="dest-card"><div class="dest-photo-wrap"></div><h3 class="dest-name">Phnom Penh</h3></article>
      <section class="detail-hero" data-destination="Phnom Penh"></section>
    `;
    initCardRatings();
    initDetailRating();

    const cardBadge = document.querySelector('.dest-card .dest-rating');
    cardBadge.dispatchEvent(new Event('mouseenter'));
    expect(document.querySelector('body > .dest-rating-tip')).toBeNull();

    const detailBadge = document.querySelector('.dest-rating--detail');
    detailBadge.dispatchEvent(new Event('mouseenter'));
    const tip = document.querySelector('body > .dest-rating-tip');
    expect(tip).not.toBeNull();
    expect(tip.classList.contains('is-visible')).toBe(true);
    expect(tip.textContent).toContain('4.0 out of 5');
    expect(tip.querySelectorAll('.drt-row')).toHaveLength(5);
    expect(tip.querySelectorAll('.drt-action-btn')).toHaveLength(2);
    tip.dispatchEvent(new Event('mouseleave'));
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(document.querySelector('body > .dest-rating-tip')).toBeNull();
  });

  test('rating details reopen after closing the review dialog', async () => {
    document.body.innerHTML =
      '<section class="detail-hero" data-destination="Phnom Penh"></section>';
    initDetailRating();

    const badge = document.querySelector('.dest-rating--detail');
    badge.dispatchEvent(new Event('mouseenter'));
    const postButton = document.querySelector('.drt-action-post');
    postButton.focus();
    postButton.click();

    expect(document.querySelector('.review-modal-overlay')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    document.querySelector('.rmo-close').click();

    expect(document.querySelector('.review-modal-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(badge);
    expect(document.querySelector('body > .dest-rating-tip.is-visible')).not.toBeNull();

    document.body.dispatchEvent(new Event('pointermove', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 110));
    expect(document.querySelector('body > .dest-rating-tip.is-visible')).toBeNull();

    badge.dispatchEvent(new Event('mouseenter'));
    expect(document.querySelector('body > .dest-rating-tip.is-visible')).not.toBeNull();
  });

  test('the detail rating opens on click as well as hover', () => {
    document.body.innerHTML =
      '<section class="detail-hero" data-destination="Phnom Penh"></section>';
    initDetailRating();

    document.querySelector('.dest-rating--detail').click();

    expect(document.querySelector('body > .dest-rating-tip.is-visible')).not.toBeNull();
  });

  test('detail page shows reviews for its destination only', async () => {
    document.querySelector('[data-reviews]').dataset.destination = 'Phnom Penh';
    initReviews();
    await nextTick();
    expect(document.querySelector('[data-review-count]').textContent).toBe('1 review');
    expect(document.querySelector('[data-review-list]').textContent).toContain('Royal Palace');
    expect(document.querySelector('[data-review-list]').textContent).not.toContain('Angkor Wat');
  });

  test('validates, creates, edits, deletes, and stores a review', async () => {
    initReviews();
    await nextTick();
    const form = document.querySelector('#review-form');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('[data-review-status]').textContent).toContain(
      'Please enter your name'
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);

    form.elements.name.value = 'Sokha';
    form.elements.destination.value = 'Kampot';
    form.elements.rating.value = '5';
    form.elements.comment.value = 'I enjoyed the quiet riverside.';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await nextTick();

    expect(document.querySelector('[data-review-count]').textContent).toBe('4 reviews');
    expect(JSON.parse(localStorage.getItem('kamsan:reviews'))[0].name).toBe('Sokha');

    document.querySelector('[data-review-action="edit"]').click();
    form.elements.comment.value = 'The riverside was peaceful and easy to walk.';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await nextTick();
    expect(document.querySelector('[data-review-list]').textContent).toContain(
      'peaceful and easy to walk'
    );

    document.querySelector('[data-review-action="delete"]').click();
    await nextTick();
    expect(document.querySelector('[data-review-count]').textContent).toBe('3 reviews');
    expect(global.fetch.mock.calls.map(([, options]) => options.method || 'GET')).toEqual([
      'GET',
      'POST',
      'PUT',
      'DELETE',
    ]);
  });

  test('shows a new review even if the demo API fails', async () => {
    global.fetch.mockImplementation(async (_url, options = {}) => {
      if (!options.method) return response([{ id: 1 }, { id: 2 }, { id: 3 }]);
      throw new Error('Network unavailable');
    });
    initReviews();
    await nextTick();
    const form = document.querySelector('#review-form');
    form.elements.name.value = 'Sokha';
    form.elements.destination.value = 'Kampot';
    form.elements.rating.value = '5';
    form.elements.comment.value = 'A lovely walk by the river.';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await nextTick();

    expect(document.querySelector('[data-review-count]').textContent).toBe('4 reviews');
    expect(JSON.parse(localStorage.getItem('kamsan:reviews'))[0].name).toBe('Sokha');
    expect(document.querySelector('[data-review-status]').textContent).toContain(
      'demo API is unavailable'
    );
  });
});
