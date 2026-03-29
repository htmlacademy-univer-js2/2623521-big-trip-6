import {render, RenderPosition} from './render.js';

import FiltersView from './view/filters-view.js';
import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import PointPresenter from './presenter/point-presenter.js';

export default class Presenter {
  #pointsModel = null;

  #filtersContainer = null;
  #tripEventsContainer = null;

  #tripListComponent = new TripListView();
  #pointPresenters = new Map();

  constructor(pointsModel) {
    this.#pointsModel = pointsModel;

    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    render(new FiltersView(), this.#filtersContainer, RenderPosition.BEFOREEND);
    render(new SortView(), this.#tripEventsContainer, RenderPosition.BEFOREEND);
    render(this.#tripListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = this.#tripListComponent.getElement();
    const points = this.#pointsModel.points;

    for (const point of points) {
      const destination = this.#pointsModel.getDestinationById(point.destinationId);
      const offers = this.#pointsModel
        .getOffersByType(point.type)
        .filter((offer) => point.offersIds.includes(offer.id));

      const pointPresenter = new PointPresenter({
        listContainer: listElement,
        onModeChange: this.#handlePointModeChange,
      });

      pointPresenter.init({point, destination, offers});
      this.#pointPresenters.set(point.id, pointPresenter);
    }
  }

  #handlePointModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
