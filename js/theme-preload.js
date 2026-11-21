// Match the device theme before stylesheets paint the page.
(() => {
  const systemIsDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.themePreference = 'system';
  document.documentElement.dataset.theme = systemIsDark ? 'dark' : 'light';
})();
