import { initSearchFilter } from './features/searchFilter.js';

document.addEventListener('DOMContentLoaded', () => {
  initSearchFilter({
    buttonSelector: '.filter-pill[data-filter]',
    cardSelector: '.food-photo-card[data-category], .mini-food-card[data-category]',
    searchSelector: '#food-search',
    clearButtonSelector: '#clear-food-search',
    noResultsSelector: '#no-results',
    resultSectionSelector: 'main > .page-section',
    searchActiveClass: 'food-search-active',
    resultsLabelSelector: '#food-results-title',
    resultsContainerSelector: '#food-filter-results',
    uniqueResultSelector: 'h3',
    activeClass: 'active',
    allValue: 'all',
  });
});
