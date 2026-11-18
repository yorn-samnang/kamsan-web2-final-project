import { getStoredValue, setStoredValue } from '../state/store.js';
import { createElement } from '../utils/dom.js';

const THEME_STORAGE_KEY = 'kamsan:theme';

export function initThemeToggle() {
  if (document.querySelector('[data-theme-toggle]')) return;

  const button = createElement('button', {
    className: 'theme-toggle',
    dataset: { themeToggle: '' },
    attributes: { type: 'button' },
  });
  document.body.append(button);

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    button.textContent = isDark ? '☀' : '☾';
    button.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
    button.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  }

  const savedTheme = getStoredValue(THEME_STORAGE_KEY, 'light');
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');

  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setStoredValue(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });
}
