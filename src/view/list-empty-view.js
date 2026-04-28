import AbstractView from './abstract-view.js';

export default class ListEmptyView extends AbstractView {
  #filterType;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return `<p class="trip-events__msg">There are no ${this.#filterType} events now</p>`;
  }
}
