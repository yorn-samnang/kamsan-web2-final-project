import { createContactMessage } from './services/contactApi.js';
import { notify } from './utils/dom.js';

const trigger = document.getElementById('open-contact-modal');
const modal = document.getElementById('contact-modal');

if (trigger && modal) {
  const closeButton = modal.querySelector('.contact-modal-close');
  const firstField = modal.querySelector('#full-name');
  const form = modal.querySelector('.contact-form');
  const submitButton = form?.querySelector('[type="submit"]');
  const status = form?.querySelector('.contact-form-status');
  let isSubmitting = false;

  trigger.addEventListener('click', () => {
    if (status) {
      status.textContent = '';
      status.removeAttribute('data-state');
    }
    modal.showModal();
    firstField?.focus();
  });

  closeButton?.addEventListener('click', () => {
    if (!isSubmitting) modal.close();
  });

  modal.addEventListener('cancel', (event) => {
    if (isSubmitting) event.preventDefault();
  });

  modal.addEventListener('click', (event) => {
    if (event.target !== modal) return;
    const bounds = modal.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside && !isSubmitting) modal.close();
  });

  modal.addEventListener('close', () => trigger.focus());

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !form.reportValidity()) return;

    const fields = new window.FormData(form);
    const message = {
      fullName: String(fields.get('full-name')).trim(),
      email: String(fields.get('email')).trim(),
      topic: String(fields.get('topic')),
      message: String(fields.get('message')).trim(),
      createdAt: new Date().toISOString(),
    };

    if (!message.fullName || !message.message) {
      status.textContent = 'Please enter your name and a message.';
      status.dataset.state = 'error';
      return;
    }

    isSubmitting = true;
    form.setAttribute('aria-busy', 'true');
    closeButton.disabled = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    status.textContent = 'Saving your message…';
    status.dataset.state = 'pending';

    let result;
    try {
      await createContactMessage(message);
      form.reset();
      result = { state: 'success', message: 'Stored in Mockoon. No email was sent.' };
    } catch {
      result = {
        state: 'error',
        message: 'Check Mockoon and try again. Your entries are still here.',
      };
    } finally {
      isSubmitting = false;
      form.removeAttribute('aria-busy');
      closeButton.disabled = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Send Message';
      status.textContent = '';
      status.removeAttribute('data-state');
      modal.close();
      notify({
        title: result.state === 'success' ? 'Message saved' : 'Message not saved',
        message: result.message,
        state: result.state,
        duration: result.state === 'error' ? 6500 : 4500,
      });
    }
  });
}
