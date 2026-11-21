import { request } from './apiClient.js';

// Match this port to the Mockoon environment used during local development.
export const CONTACT_API_URL = 'http://127.0.0.1:3001/messages';

export function createContactMessage(message) {
  return request(CONTACT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  }).then((savedMessage) => {
    if (!savedMessage || typeof savedMessage !== 'object' || !savedMessage.id) {
      throw new Error('The contact API did not return a saved message.');
    }
    return savedMessage;
  });
}
