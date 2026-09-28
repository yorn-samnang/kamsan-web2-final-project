/** Returns the first element that matches a selector within an optional scope. */
export function select(selector, scope = document) {
  return scope.querySelector(selector);
}

/** Returns all matching elements as an array, making array methods safe to use. */
export function selectAll(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/** Creates an element with common content, data, and accessibility properties. */
export function createElement(tagName, options = {}) {
  const { attributes = {}, className, dataset = {}, text } = options;
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  Object.entries(dataset).forEach(([name, value]) => {
    element.dataset[name] = value;
  });

  return element;
}

/** Replaces all children of an element. */
export function clearElement(element) {
  element.replaceChildren();
}

/** Updates text content without treating text as HTML. */
export function setText(element, text) {
  element.textContent = text;
}

/** Renders a short loading message in a live region. */
export function renderLoading(element, message = 'Loading…') {
  element.replaceChildren(createElement('p', { className: 'loading-message', text: message }));
  element.setAttribute('aria-busy', 'true');
}

/** Renders an accessible error message without injecting HTML. */
export function renderError(element, message = 'Something went wrong. Please try again.') {
  element.replaceChildren(
    createElement('p', {
      className: 'error-message',
      attributes: { role: 'alert' },
      text: message,
    })
  );
  element.removeAttribute('aria-busy');
}

/** Shows a temporary, accessible notification. */
export function toast(message, { duration = 4000, root = document } = {}) {
  let region = select('[data-toast-region]', root);

  if (!region) {
    region = createElement('div', {
      className: 'toast-region',
      dataset: { toastRegion: '' },
      attributes: { 'aria-live': 'polite', 'aria-atomic': 'true' },
    });
    (root.body || root).append(region);
  }

  const notification = createElement('p', { className: 'toast', text: message });
  region.append(notification);

  if (duration > 0) {
    window.setTimeout(() => notification.remove(), duration);
  }

  return notification;
}

// Short aliases keep feature modules concise and match the project plan terminology.
export const qs = select;
export const qsa = selectAll;
export const createEl = createElement;
