import { readFileSync } from 'node:fs';

test('the Phnom Penh page loads its review actions and opens both dialogs', () => {
  const pageUrl = new URL('../pages/destination-phnom-penh.html', import.meta.url);
  const html = readFileSync(pageUrl, 'utf8');
  const parsed = new window.DOMParser().parseFromString(html, 'text/html');
  const script = parsed.querySelector('script[src$="destination-detail.bundle.js"]');
  expect(script).not.toBeNull();
  expect(script.getAttribute('src')).toBe('../js/destination-detail.bundle.js');

  // Resolve the asset from the page location, just as the browser does.
  const bundle = readFileSync(new URL(script.getAttribute('src'), pageUrl), 'utf8');
  document.body.innerHTML = parsed.body.innerHTML;
  window.localStorage.clear();
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(bundle);
  document.dispatchEvent(new Event('DOMContentLoaded'));

  expect(document.querySelector('.dest-rating--fallback')).toBeNull();
  document.querySelector('.dest-rating--detail').click();
  const post = document.querySelector('.drt-action-post');
  const read = document.querySelector('.drt-action-read');
  expect(post.textContent).toContain('Post Review');
  expect(read.textContent).toContain('Read Reviews');

  post.click();
  expect(document.querySelector('[role="dialog"]').textContent).toContain('Post a Review');
  document.querySelector('.rmo-close').click();

  document.querySelector('.dest-rating--detail').click();
  document.querySelector('.drt-action-read').click();
  expect(document.querySelector('[role="dialog"]').textContent).toContain('Royal Palace');
  document.querySelector('.rmo-close').click();
});
