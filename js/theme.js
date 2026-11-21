import { createElement } from './utils/dom.js';

let removeThemeListener = () => {};

export function initThemeToggle() {
  if (document.querySelector('[data-theme-toggle][data-theme-ready]')) return;
  removeThemeListener();
  document.querySelector('[data-theme-toggle]')?.remove();

  const button = createElement('button', {
    className: 'theme-toggle',
    dataset: { themeToggle: '', themeReady: '' },
    attributes: { type: 'button' },
  });
  document.body.append(button);
  const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  function applyTheme(theme, followDevice = false) {
    const isDark = theme === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = followDevice ? 'system' : theme;
    button.textContent = isDark ? '☾' : '☀';
    const source = followDevice ? ' (following device)' : '';
    const label = `Theme: ${theme}${source}. Switch to ${nextTheme} mode`;
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  function applyDeviceTheme() {
    applyTheme(systemTheme?.matches ? 'dark' : 'light', true);
  }

  applyDeviceTheme();
  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  const onSystemThemeChange = () => applyDeviceTheme();
  if (systemTheme?.addEventListener) {
    systemTheme.addEventListener('change', onSystemThemeChange);
  } else {
    systemTheme?.addListener?.(onSystemThemeChange);
  }
  removeThemeListener = () => {
    if (systemTheme?.removeEventListener) {
      systemTheme.removeEventListener('change', onSystemThemeChange);
    } else {
      systemTheme?.removeListener?.(onSystemThemeChange);
    }
  };
}

if (document.body) initThemeToggle();
