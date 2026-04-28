import {render, RenderPosition, remove} from './render.js';

import FiltersView from './view/filters-view.js';
import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import PointPresenter from './presenter/point-presenter.js';

import LoadingView from './view/loading-view.js';
import FailedLoadDataView from './view/failed-load-data-view.js';
import ListEmptyView from './view/list-empty-view.js';

const UiState = {
  LOADING: 'loading',
  ERROR: 'error',
  READY: 'ready',
};

export default class Presenter {
  #pointsModel = null;

  #filtersContainer = null;
  #tripEventsContainer = null;

  #tripListComponent = null;
  #pointPresenters = new Map();

  #uiState = UiState.READY;

  #loadingComponent = new LoadingView();
  #failedComponent = new FailedLoadDataView();
  #emptyComponent = null;

  constructor(pointsModel) {
    this.#pointsModel = pointsModel;

    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    render(new FiltersView(), this.#filtersContainer, RenderPosition.BEFOREEND);
    render(new SortView(), this.#tripEventsContainer, RenderPosition.BEFOREEND);

    const points = this.#pointsModel?.points ?? [];

    if (this.#uiState === UiState.LOADING) {
      this.#renderLoading();
      return;
    }

    if (this.#uiState === UiState.ERROR) {
      this.#renderError();
      return;
    }

    if (points.length === 0) {
      this.#renderEmpty();
      return;
    }

    this.#renderPoints(points);
  }

  #clearMessages() {
    remove(this.#loadingComponent);
    remove(this.#failedComponent);

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
  }

  #renderLoading() {
    this.#clearMessages();
    render(this.#loadingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderError() {
    this.#clearMessages();
    render(this.#failedComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderEmpty() {
    this.#clearMessages();
    this.#emptyComponent = new ListEmptyView({filterType: 'everything'});
    render(this.#emptyComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderPoints(points) {
    this.#clearMessages();

    this.#tripListComponent = new TripListView();
    render(this.#tripListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = this.#tripListComponent.getElement();

    this.#pointPresenters.clear();

    for (const point of points) {
      const destination = this.#pointsModel.getDestinationById(point.destinationId);
      const offers = this.#pointsModel
        .getOffersByType(point.type)
        .filter((offer) => point.offersIds.includes(offer.id));

      const pointPresenter = new PointPresenter({
        listContainer: listElement,
        onModeChange: this.#handlePointModeChange,
        onDataChange: this.#handlePointChange,
      });

      pointPresenter.init({point, destination, offers});
      this.#pointPresenters.set(point.id, pointPresenter);
    }
  }

  #handlePointModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    // 1) Actualizar datos en el "mock/model"
    const points = this.#pointsModel.points;
    const index = points.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return;
    }
    points[index] = updatedPoint;

    // 2) Re-render SOLO ese punto
    const destination = this.#pointsModel.getDestinationById(updatedPoint.destinationId);
    const offers = this.#pointsModel
      .getOffersByType(updatedPoint.type)
      .filter((offer) => updatedPoint.offersIds.includes(offer.id));

    this.#pointPresenters.get(updatedPoint.id).init({
      point: updatedPoint,
      destination,
      offers,
    });
  };
}
