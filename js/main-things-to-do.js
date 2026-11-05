import { initSearchFilter } from './features/searchFilter.js';

document.addEventListener('DOMContentLoaded', () => {
  initSearchFilter({
    buttonSelector: '.filter-btn[data-filter]',
    cardSelector: 'section[data-category]',
    noResultsSelector: '#no-results',
  });

  const searchInput = document.querySelector('#activity-search');
  const clearSearch = document.querySelector('#clear-activity-search');
  const resultsTitle = document.querySelector('#things-results-title');
  const resultsContainer = document.querySelector('#things-filter-results');
  const noResults = document.querySelector('#no-results');
  const resultCards = [...document.querySelectorAll('.place-card[data-category]')];
  const resultSections = [...document.querySelectorAll('section[data-category]')];
  const cardParents = new Map(resultCards.map((card) => [card, card.parentElement]));
  const filterButtons = [...document.querySelectorAll('.filter-btn[data-filter]')];
  let activeCategory = 'all';

  const updateSearch = () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const isSearching = Boolean(searchTerm);
    const resultNames = new Set();

    resultCards.forEach((card) => {
      const name = card.querySelector('h3')?.textContent.trim().toLowerCase();
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matches = matchesCategory && card.textContent.toLowerCase().includes(searchTerm);
      const isDuplicate = matches && name && resultNames.has(name);
      card.hidden = isSearching && (!matches || isDuplicate);
      if (matches && !isDuplicate && name) resultNames.add(name);
    });

    resultSections.forEach((section) => {
      section.classList.toggle('search-result-section-hidden', isSearching);
    });

    resultsContainer.hidden = !isSearching;
    resultCards.forEach((card) => {
      const destination = isSearching ? resultsContainer : cardParents.get(card);
      destination?.append(card);
    });

    const resultCount = resultCards.filter((card) => !card.hidden).length;
    noResults.hidden = !isSearching || resultCount !== 0;
    clearSearch.hidden = !isSearching;
    resultsTitle.hidden = !isSearching;
    resultsTitle.textContent = isSearching
      ? `Search results for “${searchInput.value.trim()}”`
      : '';
    document.body.classList.toggle('things-search-active', isSearching);
  };

  searchInput.addEventListener('input', updateSearch);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.filter;
      if (searchInput.value.trim()) updateSearch();
    });
  });
  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    updateSearch();
    searchInput.focus();
  });

  const cards = document.querySelectorAll('.place-card');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  cards.forEach((card) => {
    observer.observe(card);
  });
});
