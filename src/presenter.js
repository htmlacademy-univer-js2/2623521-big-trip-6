import {render, RenderPosition} from './render.js';

import FiltersView from './view/filters-view.js';
import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import TripEventView from './view/trip-event-view.js';
import EditFormView from './view/edit-form-view.js';

export default class Presenter {
  constructor(pointsModel) {
    this.pointsModel = pointsModel;
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    render(new FiltersView(), this.filtersContainer, RenderPosition.BEFOREEND);
    render(new SortView(), this.tripEventsContainer, RenderPosition.BEFOREEND);

    const list = new TripListView();
    render(list, this.tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = list.getElement();

    // Edit form primero (como antes)
    const firstPoint = this.pointsModel.points[0];
    render(new EditFormView(firstPoint), listElement, RenderPosition.AFTERBEGIN);

    // Render puntos desde el model
    for (const point of this.pointsModel.points) {
      const destination = this.pointsModel.getDestinationById(point.destinationId);
      const offers = this.pointsModel.getOffersByType(point.type)
        .filter((o) => point.offersIds.includes(o.id));

      render(new TripEventView({point, destination, offers}), listElement, RenderPosition.BEFOREEND);
    }
  }
}
