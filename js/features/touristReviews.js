import { createReview, deleteReview, getReviews, updateReview } from '../services/reviewApi.js';
import { createElement } from '../utils/dom.js';
import { validateReview } from '../utils/validate.js';

const STORAGE_KEY = 'kamsan:reviews';

// JSONPlaceholder posts contain filler text, so these clearly labeled examples
// use simple English written for this class project. Their IDs come from GET /posts.
const SAMPLE_REVIEWS = [
  {
    id: '1',
    apiId: 1,
    name: 'Sample traveler',
    destination: 'Phnom Penh',
    rating: 4,
    comment: 'The Royal Palace was beautiful, and it was easy to explore the city by tuk-tuk.',
    sample: true,
  },
  {
    id: '2',
    apiId: 2,
    name: 'Sample traveler',
    destination: 'Siem Reap',
    rating: 5,
    comment: 'Angkor Wat at sunrise was worth the early start. Bring water and comfortable shoes.',
    sample: true,
  },
  {
    id: '3',
    apiId: 3,
    name: 'Sample traveler',
    destination: 'Kampot',
    rating: 5,
    comment: 'Kampot was peaceful. We enjoyed the riverside walk and a visit to a pepper farm.',
    sample: true,
  },
];

function readSavedReviews() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

function saveReviews(reviews) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    return true;
  } catch {
    return false;
  }
}

function makeReviewCard(review) {
  const card = createElement('article', { className: 'review-card' });
  const heading = createElement('h4', {
    text: `${review.name}${review.sample ? ' (sample)' : ''}`,
  });
  const details = createElement('p', {
    className: 'review-details',
    text: `${review.destination} · ${review.rating}/5 stars`,
  });
  const comment = createElement('p', { text: review.comment });
  const actions = createElement('div', { className: 'review-actions' });

  for (const [action, label] of [
    ['edit', 'Edit'],
    ['delete', 'Delete'],
  ]) {
    actions.append(
      createElement('button', {
        className: 'review-action-button',
        text: label,
        attributes: { type: 'button' },
        dataset: { reviewAction: action, reviewId: review.id },
      })
    );
  }

  card.append(heading, details, comment, actions);
  return card;
}

export function initReviews({ root = document } = {}) {
  const section = root.querySelector('[data-reviews]');
  if (!section) return;

  const form = section.querySelector('#review-form');
  const list = section.querySelector('[data-review-list]');
  const count = section.querySelector('[data-review-count]');
  const status = section.querySelector('[data-review-status]');
  const submitButton = form.querySelector('[type="submit"]');
  const cancelButton = form.querySelector('[data-cancel-edit]');
  const saved = readSavedReviews();
  let reviews = saved || SAMPLE_REVIEWS.map((review) => ({ ...review }));
  let editingId = null;
  let busy = false;
  let hasChanged = false;

  function render() {
    count.textContent = `${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`;
    list.replaceChildren(...reviews.map(makeReviewCard));
  }

  function resetForm() {
    form.reset();
    editingId = null;
    submitButton.textContent = 'Post review';
    cancelButton.hidden = true;
  }

  async function loadReviews() {
    render();
    status.textContent = 'Checking the demo API…';
    try {
      const posts = await getReviews({ limit: 3 });
      if (saved === null && !hasChanged && posts.length) {
        reviews = posts
          .map((post) => SAMPLE_REVIEWS.find((review) => review.apiId === post.id))
          .filter(Boolean);
      }
      status.textContent = '';
    } catch {
      status.textContent = 'Demo API unavailable. Reviews in this browser are still shown.';
    }
    render();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;

    const review = Object.fromEntries(new window.FormData(form));
    const validation = validateReview(review);
    if (!validation.isValid) {
      status.textContent = Object.values(validation.errors).join(' ');
      return;
    }

    busy = true;
    submitButton.disabled = true;
    let apiRequest;
    try {
      if (editingId) {
        const current = reviews.find((item) => item.id === editingId);
        apiRequest = updateReview(current.apiId, review);
        reviews = reviews.map((item) =>
          item.id === editingId ? { ...item, ...review, rating: Number(review.rating) } : item
        );
      } else {
        apiRequest = createReview(review);
        reviews.unshift({
          ...review,
          id: String(Date.now()),
          // New JSONPlaceholder posts are not really stored. Use an existing
          // demo post for later PUT and DELETE requests.
          apiId: 1,
          rating: Number(review.rating),
          sample: false,
        });
      }
      hasChanged = true;
      const stored = saveReviews(reviews);
      render();
      resetForm();
      status.textContent = stored
        ? 'Review saved in this browser. Checking demo API…'
        : 'Review updated for this visit, but browser storage is unavailable.';
      await apiRequest;
      if (stored) status.textContent = 'Review saved in this browser.';
    } catch {
      status.textContent = 'Review saved in this browser, but the demo API is unavailable.';
    } finally {
      busy = false;
      submitButton.disabled = false;
    }
  });

  list.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-review-action]');
    if (!button || busy) return;
    const review = reviews.find((item) => item.id === button.dataset.reviewId);
    if (!review) return;

    if (button.dataset.reviewAction === 'edit') {
      for (const field of ['name', 'destination', 'rating', 'comment']) {
        form.elements[field].value = review[field];
      }
      editingId = review.id;
      submitButton.textContent = 'Save changes';
      cancelButton.hidden = false;
      status.textContent = `Editing ${review.destination} review.`;
      form.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!window.confirm('Delete this review from this browser?')) return;
    busy = true;
    reviews = reviews.filter((item) => item.id !== review.id);
    hasChanged = true;
    const stored = saveReviews(reviews);
    if (editingId === review.id) resetForm();
    render();
    status.textContent = 'Review deleted from this browser. Checking demo API…';
    try {
      await deleteReview(review.apiId);
      status.textContent = stored
        ? 'Review deleted from this browser.'
        : 'Review removed for this visit, but browser storage is unavailable.';
    } catch {
      status.textContent = 'Review deleted from this browser, but the demo API is unavailable.';
    } finally {
      busy = false;
    }
  });

  cancelButton.addEventListener('click', () => {
    resetForm();
    status.textContent = 'Edit canceled.';
  });

  loadReviews();
}
