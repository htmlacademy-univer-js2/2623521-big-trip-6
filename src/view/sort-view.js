import AbstractView from './abstract-view.js';
import {SortType} from '../const.js';

export default class SortView extends AbstractView {
  #currentSortType;
  #handleSortTypeChange;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.getElement().addEventListener('change', this.#sortChangeHandler);
  }

  get template() {
    return `
      <form class="trip-events__trip-sort  trip-sort" action="#" method="get">
        <div class="trip-sort__item  trip-sort__item--day">
          <input
            id="sort-day"
            class="trip-sort__input  visually-hidden"
            type="radio"
            name="trip-sort"
            data-sort-type="${SortType.DAY}"
            ${this.#currentSortType === SortType.DAY ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-day">Day</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--time">
          <input
            id="sort-time"
            class="trip-sort__input  visually-hidden"
            type="radio"
            name="trip-sort"
            data-sort-type="${SortType.TIME}"
            ${this.#currentSortType === SortType.TIME ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-time">Time</label>
        </div>

        <div class="trip-sort__item  trip-sort__item--price">
          <input
            id="sort-price"
            class="trip-sort__input  visually-hidden"
            type="radio"
            name="trip-sort"
            data-sort-type="${SortType.PRICE}"
            ${this.#currentSortType === SortType.PRICE ? 'checked' : ''}>
          <label class="trip-sort__btn" for="sort-price">Price</label>
        </div>

        <span class="trip-sort__item  trip-sort__item--offer">Offers</span>
        <span class="trip-sort__item  trip-sort__item--event">Event</span>
      </form>
    `;
  }

  #sortChangeHandler = (evt) => {
    const sortType = evt.target.dataset.sortType;

    if (!sortType) {
      return;
    }

    this.#handleSortTypeChange(sortType);
  };
}
