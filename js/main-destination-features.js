import { initFavorites } from './features/favorites.js';
import { initCardRatings } from './features/touristReviews.js';

document.addEventListener('DOMContentLoaded', () => {
  initFavorites();
  initCardRatings();
});
