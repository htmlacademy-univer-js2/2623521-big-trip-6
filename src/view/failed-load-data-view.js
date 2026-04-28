import AbstractView from './abstract-view.js';

export default class FailedLoadDataView extends AbstractView {
  get template() {
    return '<p class="trip-events__msg">Failed to load latest route information</p>';
  }
}
