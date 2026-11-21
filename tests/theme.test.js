import { initThemeToggle } from '../js/theme.js';

let systemTheme;

beforeEach(() => {
  document.body.replaceChildren();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-theme-preference');
  localStorage.clear();

  const listeners = new Set();
  systemTheme = {
    matches: false,
    addEventListener: (_event, listener) => listeners.add(listener),
    removeEventListener: (_event, listener) => listeners.delete(listener),
    change(matches) {
      this.matches = matches;
      listeners.forEach((listener) => listener());
    },
  };
  window.matchMedia = () => systemTheme;
});

test('defaults to system mode and follows device theme changes', () => {
  initThemeToggle();

  const button = document.querySelector('[data-theme-toggle]');
  expect(document.documentElement.dataset.themePreference).toBe('system');
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(button.textContent).toBe('☀');
  expect(button.getAttribute('aria-label')).toBe(
    'Theme: light (following device). Switch to dark mode'
  );

  systemTheme.change(true);
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(button.textContent).toBe('☾');
  systemTheme.change(false);
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(button.textContent).toBe('☀');
});

test('clicking the toggle temporarily switches between light and dark', () => {
  initThemeToggle();
  const button = document.querySelector('[data-theme-toggle]');

  button.click();
  expect(document.documentElement.dataset.themePreference).toBe('dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(button.textContent).toBe('☾');

  button.click();
  expect(document.documentElement.dataset.themePreference).toBe('light');
  expect(button.textContent).toBe('☀');

  document.body.replaceChildren();
  systemTheme.change(true);
  initThemeToggle();
  expect(document.documentElement.dataset.themePreference).toBe('system');
  expect(document.documentElement.dataset.theme).toBe('dark');
});

test('clicking from device dark mode selects light', () => {
  systemTheme.change(true);
  initThemeToggle();
  document.querySelector('[data-theme-toggle]').click();
  expect(document.documentElement.dataset.themePreference).toBe('light');
  expect(document.documentElement.dataset.theme).toBe('light');
});

test('device changes override a manual light or dark selection', () => {
  initThemeToggle();
  const button = document.querySelector('[data-theme-toggle]');
  button.click();
  expect(document.documentElement.dataset.theme).toBe('dark');

  systemTheme.change(true);
  expect(document.documentElement.dataset.themePreference).toBe('system');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(button.getAttribute('aria-label')).toContain('following device');

  button.click();
  expect(document.documentElement.dataset.theme).toBe('light');
  systemTheme.change(false);
  expect(document.documentElement.dataset.themePreference).toBe('system');
  expect(document.documentElement.dataset.theme).toBe('light');
});

test('ignores an old saved theme and starts with the device setting', () => {
  localStorage.setItem('kamsan:theme', JSON.stringify('light'));
  systemTheme.change(true);
  initThemeToggle();
  expect(document.documentElement.dataset.themePreference).toBe('system');
  expect(document.documentElement.dataset.theme).toBe('dark');
});
