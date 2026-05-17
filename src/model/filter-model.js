import {FilterType} from '../const.js';

export default class FilterModel {
  #filter = FilterType.EVERYTHING;

  getFilter() {
    return this.#filter;
  }

  setFilter(filterType) {
    this.#filter = filterType;
  }
}
