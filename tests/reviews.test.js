import { jest } from '@jest/globals';
import { initReviews } from '../js/features/touristReviews.js';

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
