import { select, selectAll } from '../utils/dom.js';

/**
 * Connects a search field and filter buttons to a collection of cards.
 *
 * @param {object} [options]
 * @param {Document | Element} [options.root=document] Element to search within.
 * @param {string} [options.buttonSelector='.filter-btn[data-region]'] Filter button selector.
 * @param {string} [options.cardSelector='.dest-card[data-region]'] Card selector.
 * @param {string} [options.searchSelector] Search input selector.
 * @param {string} [options.clearButtonSelector] Clear-search button selector.
 * @param {string} [options.noResultsSelector='#no-results'] No-results message selector.
 * @param {string} [options.activeClass='active'] Active button class name.
 * @param {string} [options.allValue='all'] Value that displays every card.
 * @param {string} [options.resultSectionSelector] Sections to hide when filtering has no matches.
 * @param {string} [options.searchActiveClass] Class applied to the root while searching or filtering.
 * @param {string} [options.resultsLabelSelector] Element that displays the active search or filter label.
 * @param {string} [options.resultsContainerSelector] Container that displays matched cards in one layout.
 * @param {string} [options.uniqueResultSelector] Descendant selector used to remove duplicate filtered results.
 * @returns {{ filterByRegion: (region: string) => number, destroy: () => void }}
 */
export function initSearchFilter({
  root = document,
  buttonSelector = '.filter-btn[data-region]',
  cardSelector = '.dest-card[data-region]',
  searchSelector,
  clearButtonSelector,
  noResultsSelector = '#no-results',
  activeClass = 'active',
  allValue = 'all',
  resultSectionSelector,
  searchActiveClass,
  resultsLabelSelector,
  resultsContainerSelector,
  uniqueResultSelector,
} = {}) {
  const buttons = selectAll(buttonSelector, root);
  const cards = selectAll(cardSelector, root);
  const searchInput = searchSelector ? select(searchSelector, root) : null;
  const clearButton = clearButtonSelector ? select(clearButtonSelector, root) : null;
  const noResults = select(noResultsSelector, root);
  const resultSections = resultSectionSelector ? selectAll(resultSectionSelector, root) : [];
  const resultsLabel = resultsLabelSelector ? select(resultsLabelSelector, root) : null;
  const resultsContainer = resultsContainerSelector ? select(resultsContainerSelector, root) : null;
  const cardParents = new Map(cards.map((card) => [card, card.parentElement]));
  let activeFilter = allValue;

  const updateResults = () => {
    const searchTerm = searchInput?.value.trim().toLowerCase() || '';
    const resultsOnly = Boolean(searchTerm) || activeFilter !== allValue;

    cards.forEach((card) => {
      const cardValue = card.dataset.region || card.dataset.category;
      const matchesFilter = activeFilter === allValue || cardValue === activeFilter;
      const matchesSearch = !searchTerm || card.textContent.toLowerCase().includes(searchTerm);
      const matches = matchesFilter && matchesSearch;
      card.hidden = !matches;
    });

    if (resultsOnly && uniqueResultSelector) {
      const resultNames = new Set();
      cards.forEach((card) => {
        if (card.hidden) return;
        const name = card.querySelector(uniqueResultSelector)?.textContent.trim().toLowerCase();
        if (name && resultNames.has(name)) card.hidden = true;
        else if (name) resultNames.add(name);
      });
    }

    const visibleCount = cards.filter((card) => !card.hidden).length;

    buttons.forEach((button) => {
      const buttonValue = button.dataset.region || button.dataset.filter;
      const isActive = buttonValue === activeFilter;
      button.classList.toggle(activeClass, isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    if (noResults) noResults.hidden = visibleCount !== 0;
    if (clearButton) clearButton.hidden = !searchTerm;

    if (resultsLabel) {
      const activeButton = buttons.find((button) => {
        const buttonValue = button.dataset.region || button.dataset.filter;
        return buttonValue === activeFilter;
      });
      resultsLabel.hidden = !resultsOnly;
      resultsLabel.textContent = searchTerm
        ? `Search results for “${searchInput.value.trim()}”`
        : activeButton?.textContent.trim() || '';
    }

    if (searchActiveClass && root.body) {
      root.body.classList.toggle(searchActiveClass, resultsOnly);
    }

    resultSections.forEach((section) => {
      section.classList.toggle('search-result-section-hidden', resultsOnly);
    });

    if (resultsContainer) {
      resultsContainer.hidden = !resultsOnly;
      cards.forEach((card) => {
        const destination = resultsOnly ? resultsContainer : cardParents.get(card);
        destination?.append(card);
      });

      if (resultsOnly) {
        const visibleCards = cards.filter(
          (card) => !card.hidden && card.classList.contains('reveal')
        );
        visibleCards.forEach((card) => card.classList.remove('in-view'));
        void resultsContainer.offsetWidth;
        const showCards = () => {
          visibleCards.forEach((card, index) => {
            setTimeout(() => card.classList.add('in-view'), index * 60);
          });
        };
        const frame = root.defaultView?.requestAnimationFrame;
        if (frame) frame(showCards);
        else showCards();
      }
    }
    return visibleCount;
  };

  const filterByRegion = (region) => {
    activeFilter = region || allValue;
    return updateResults();
  };

  const handleFilterClick = (event) => {
    const value = event.currentTarget.dataset.region || event.currentTarget.dataset.filter;
    filterByRegion(value);
  };

  const handleSearchInput = () => updateResults();
  const clearSearch = () => {
    if (!searchInput) return;
    searchInput.value = '';
    updateResults();
    searchInput.focus();
  };

  buttons.forEach((button) => {
    button.addEventListener('click', handleFilterClick);
    button.setAttribute('aria-pressed', String(button.classList.contains(activeClass)));
  });
  searchInput?.addEventListener('input', handleSearchInput);
  clearButton?.addEventListener('click', clearSearch);
  updateResults();

  return {
    filterByRegion,
    destroy() {
      buttons.forEach((button) => button.removeEventListener('click', handleFilterClick));
      searchInput?.removeEventListener('input', handleSearchInput);
      clearButton?.removeEventListener('click', clearSearch);
      if (searchActiveClass && root.body) {
        root.body.classList.remove(searchActiveClass);
      }
      resultSections.forEach((section) => section.classList.remove('search-result-section-hidden'));
      if (resultsLabel) resultsLabel.hidden = true;
      if (resultsContainer) {
        resultsContainer.hidden = true;
        cards.forEach((card) => cardParents.get(card)?.append(card));
      }
    },
  };
}
