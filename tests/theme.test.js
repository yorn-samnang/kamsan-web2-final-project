import { initThemeToggle } from '../js/features/themeToggle.js';

beforeEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

test('switches themes, updates the control, and persists the selection', () => {
  initThemeToggle();

  const button = document.querySelector('[data-theme-toggle]');
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(button.textContent).toBe('☾');
  expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');

  button.click();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(button.textContent).toBe('☀');
  expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
  expect(JSON.parse(localStorage.getItem('kamsan:theme'))).toBe('dark');

  document.body.replaceChildren();
  initThemeToggle();
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(document.querySelector('[data-theme-toggle]').textContent).toBe('☀');
});

test('switches back to light mode', () => {
  localStorage.setItem('kamsan:theme', JSON.stringify('dark'));
  initThemeToggle();

  document.querySelector('[data-theme-toggle]').click();

  expect(document.documentElement.dataset.theme).toBe('light');
  expect(JSON.parse(localStorage.getItem('kamsan:theme'))).toBe('light');
});
