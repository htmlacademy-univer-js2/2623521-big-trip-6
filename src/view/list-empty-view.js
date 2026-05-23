import AbstractView from './abstract-view.js';
import {FilterType} from '../const.js';

const EmptyText = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

export default class ListEmptyView extends AbstractView {
  #filterType;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    const text = EmptyText[this.#filterType] ?? EmptyText[FilterType.EVERYTHING];
    return `<p class="trip-events__msg">${text}</p>`;
  }
}
