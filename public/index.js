/**
 * Ryan Wong
 * June 2024
 *
 * This is the .js file that handles the home page.
 */

(function () {
  'use strict';

  /**
   * Initializes the application by setting up event listeners for handling
   * input in the recommendation box.
   */
  function init() {
    setupFilter();
    setupClearFilters();
  }

  const sportCheckboxes = document.querySelectorAll('input[name="sport"]');
  const typeCheckboxes = document.querySelectorAll('input[name="type"]');
  const sportSections = document.querySelectorAll('.sport');

  /**
   * This function filters the items based on the selected sports and types.
   */
  function filterItems() {
    const selectedSports = Array.from(sportCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.id);
    const selectedTypes = Array.from(typeCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.id);

    sportSections.forEach((section) => {
      const sport = section.id;
      const figures = section.querySelectorAll('figure');
      let shouldDisplaySport =
        selectedSports.length === 0 || selectedSports.includes(sport);

      figures.forEach((figure) => {
        const itemType = figure.querySelector('img').dataset.type;
        const shouldDisplayItem =
          selectedTypes.length === 0 || selectedTypes.includes(itemType);
        figure.style.display = shouldDisplayItem ? 'inline-block' : 'none';
      });

      section.style.display =
        shouldDisplaySport &&
        Array.from(figures).some(
          (figure) => figure.style.display === 'inline-block'
        )
          ? 'block'
          : 'none';
    });
  }

  /**
   * This function sets up the event listeners for the filter checkboxes.
   */
  function setupFilter() {
    sportCheckboxes.forEach((checkbox) =>
      checkbox.addEventListener('change', filterItems)
    );
    typeCheckboxes.forEach((checkbox) =>
      checkbox.addEventListener('change', filterItems)
    );
  }

  /**
   * This function sets up the event listener for the clear filters button.
   */
  function setupClearFilters() {
    const clearFiltersButton = document.getElementById('clear-filters');
    clearFiltersButton.addEventListener('click', () => {
      sportCheckboxes.forEach((checkbox) => (checkbox.checked = false));
      typeCheckboxes.forEach((checkbox) => (checkbox.checked = false));
      filterItems();
    });
  }

  init();
})();
