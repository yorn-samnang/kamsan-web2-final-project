import { jest } from '@jest/globals';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

async function loadContactModal() {
  jest.resetModules();
  await import('../js/contact-modal.js');
}

beforeEach(() => {
  document.body.innerHTML = `
    <button id="open-contact-modal" type="button">Send a Message</button>
    <dialog id="contact-modal">
      <button class="contact-modal-close" type="button">Close</button>
      <form class="contact-form">
        <input id="full-name" name="full-name" required />
        <input name="email" type="email" required />
        <select name="topic" required><option value="travel-question" selected>Travel question</option></select>
        <textarea name="message" required></textarea>
        <button type="submit">Send Message</button>
        <p class="contact-form-status" role="status"></p>
      </form>
    </dialog>
  `;

  const dialog = document.querySelector('dialog');
  dialog.showModal = jest.fn(() => {
    dialog.open = true;
  });
  dialog.close = jest.fn(() => {
    dialog.open = false;
    dialog.dispatchEvent(new Event('close'));
  });
  global.fetch = jest.fn();
});

function fillForm() {
  document.querySelector('#full-name').value = 'Sokha';
  document.querySelector('[name="email"]').value = 'sokha@example.com';
  document.querySelector('[name="message"]').value = 'Trip advice';
}

afterEach(() => {
  delete global.fetch;
  jest.restoreAllMocks();
});

test('saves a message through Mockoon, closes the modal, and shows a success toast', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => ({ id: 'message-1' }),
  });
  await loadContactModal();

  document.querySelector('#open-contact-modal').click();
  fillForm();
  const form = document.querySelector('.contact-form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  expect(form.querySelector('[type="submit"]').disabled).toBe(true);
  await tick();

  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe('http://127.0.0.1:3001/messages');
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body)).toMatchObject({
    fullName: 'Sokha',
    email: 'sokha@example.com',
    topic: 'travel-question',
    message: 'Trip advice',
    createdAt: expect.any(String),
  });
  expect(document.querySelector('#contact-modal').open).toBe(false);
  const notification = document.querySelector('.action-toast[data-state="success"]');
  expect(notification.querySelector('strong').textContent).toBe('Message saved');
  expect(notification.textContent).toContain('No email was sent');
  expect(form.querySelector('#full-name').value).toBe('');
  expect(form.querySelector('[type="submit"]').disabled).toBe(false);
  notification.querySelector('.action-toast-dismiss').click();
  expect(document.querySelector('.action-toast')).toBeNull();
});

test('closes with an error toast and keeps entered details for retry', async () => {
  global.fetch.mockRejectedValue(new Error('Connection refused'));
  await loadContactModal();

  document.querySelector('#open-contact-modal').click();
  fillForm();
  const form = document.querySelector('.contact-form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await tick();

  expect(document.querySelector('#contact-modal').open).toBe(false);
  const notification = document.querySelector('.action-toast[data-state="error"]');
  expect(notification.getAttribute('role')).toBe('alert');
  expect(notification.querySelector('strong').textContent).toBe('Message not saved');
  expect(form.querySelector('#full-name').value).toBe('Sokha');
  expect(form.querySelector('[name="message"]').value).toBe('Trip advice');
  expect(form.querySelector('[type="submit"]').disabled).toBe(false);
  document.querySelector('#open-contact-modal').click();
  expect(document.querySelector('#contact-modal').open).toBe(true);
  expect(form.querySelector('#full-name').value).toBe('Sokha');
});
