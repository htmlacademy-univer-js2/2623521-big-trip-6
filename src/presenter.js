import {render, RenderPosition} from './render.js';

import FiltersView from './view/filters-view.js';
import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import TripEventView from './view/trip-event-view.js';
import EditFormView from './view/edit-form-view.js';

export default class Presenter {
  constructor() {
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    // Filters (1)
    render(new FiltersView(), this.filtersContainer, RenderPosition.BEFOREEND);

    // Sort (1)
    render(new SortView(), this.tripEventsContainer, RenderPosition.BEFOREEND);

    // List container
    const tripList = new TripListView();
    render(tripList, this.tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = tripList.getElement();

    // Edit form (1) — first in list
    render(new EditFormView(), listElement, RenderPosition.AFTERBEGIN);

    // Events (3)
    for (let i = 0; i < 3; i++) {
      render(new TripEventView(), listElement, RenderPosition.BEFOREEND);
    }
  }
}