import AbstractView from './abstract-view.js';
import {FilterType} from '../const.js';

const FilterLabel = {
  [FilterType.EVERYTHING]: 'Everything',
  [FilterType.FUTURE]: 'Future',
  [FilterType.PRESENT]: 'Present',
  [FilterType.PAST]: 'Past',
};

export default class FiltersView extends AbstractView {
  #currentFilterType = FilterType.EVERYTHING;
  #disabledFilters = {};
  #handleFilterChange = null;

  constructor({currentFilterType, disabledFilters, onFilterChange}) {
    super();

    this.#currentFilterType = currentFilterType;
    this.#disabledFilters = disabledFilters;
    this.#handleFilterChange = onFilterChange;

    this.getElement().addEventListener('change', this.#filterChangeHandler);
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();

    if (evt.target.disabled) {
      return;
    }

    this.#handleFilterChange(evt.target.value);
  };

  get template() {
    return `
      <form class="trip-filters" action="#" method="get">
        ${Object.values(FilterType).map((filterType) => `
          <div class="trip-filters__filter">
            <input
              id="filter-${filterType}"
              class="trip-filters__filter-input visually-hidden"
              type="radio"
              name="trip-filter"
              value="${filterType}"
              ${filterType === this.#currentFilterType ? 'checked' : ''}
              ${this.#disabledFilters[filterType] ? 'disabled' : ''}
            >
            <label class="trip-filters__filter-label" for="filter-${filterType}">
              ${FilterLabel[filterType]}
            </label>
          </div>
        `).join('')}

        <button class="visually-hidden" type="submit">Accept filter</button>
      </form>
    `;
  }
}
