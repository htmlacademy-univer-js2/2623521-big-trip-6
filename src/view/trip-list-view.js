import AbstractView from './abstract-view.js';

export default class TripListView extends AbstractView {
  get template() {
    return '<ul class="trip-events__list"></ul>';
  }
}
