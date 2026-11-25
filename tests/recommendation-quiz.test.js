import { initRecommendationQuiz } from '../js/features/recommendationQuiz.js';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
  document.body.replaceChildren();
});

test('asks three questions and recommends website destinations, activities, and food', () => {
  initRecommendationQuiz();

  const trigger = document.querySelector('[data-recommendation-quiz-trigger]');
  trigger.click();
  const panel = document.querySelector('[data-recommendation-quiz]');
  panel.getBoundingClientRect = () => ({ height: 480 });
  expect(panel.textContent).toContain('Question 1 of 3');
  expect(panel.textContent).toContain('What kind of place are you in the mood for?');

  panel.querySelectorAll('.recommendation-quiz-choice')[2].click();
  panel.querySelector('.recommendation-quiz-next').click();
  panel.querySelectorAll('.recommendation-quiz-choice')[3].click();
  panel.querySelector('.recommendation-quiz-next').click();
  panel.querySelectorAll('.recommendation-quiz-choice')[1].click();
  panel.querySelector('.recommendation-quiz-next').click();

  expect(panel.textContent).toContain('Your Cambodia recommendations');
  expect(panel.textContent).toContain('Preah Sihanouk');
  expect(panel.textContent).toContain('Koh Rong');
  expect(panel.textContent).toContain('Fish Amok');
  expect([...panel.querySelectorAll('img')].every((image) => image.src.includes('/images/'))).toBe(
    true
  );
  expect(
    [...panel.querySelectorAll('img')].every((image) => !image.src.includes('/pages/images/'))
  ).toBe(true);
  expect(panel.style.height).toBe('480px');
  expect(
    [...panel.querySelectorAll('a')].every((link) => !link.getAttribute('href').startsWith('http'))
  ).toBe(true);

  panel.querySelector('.recommendation-quiz-secondary').click();
  expect(panel.style.height).toBe('');
});

test('uses image paths relative to pages on subpages', () => {
  window.history.replaceState({}, '', '/pages/trip-planner.html');
  initRecommendationQuiz();

  const trigger = document.querySelector('[data-recommendation-quiz-trigger]');
  trigger.click();
  const panel = document.querySelector('[data-recommendation-quiz]');
  panel.querySelectorAll('.recommendation-quiz-choice')[0].click();
  panel.querySelector('.recommendation-quiz-next').click();
  panel.querySelectorAll('.recommendation-quiz-choice')[0].click();
  panel.querySelector('.recommendation-quiz-next').click();
  panel.querySelectorAll('.recommendation-quiz-choice')[0].click();
  panel.querySelector('.recommendation-quiz-next').click();

  expect(
    [...panel.querySelectorAll('img')].every((image) =>
      image.getAttribute('src').startsWith('../images/')
    )
  ).toBe(true);
});

test('closes the quiz with Escape and preserves the selected answer when reopened', () => {
  initRecommendationQuiz();
  const trigger = document.querySelector('[data-recommendation-quiz-trigger]');

  trigger.click();
  document.querySelector('.recommendation-quiz-choice').click();
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(document.querySelector('[data-recommendation-quiz]').hidden).toBe(true);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');

  trigger.click();
  expect(document.querySelector('.recommendation-quiz-choice').getAttribute('aria-pressed')).toBe(
    'true'
  );
});
