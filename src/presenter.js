import {render, RenderPosition, remove} from './render.js';

import FiltersView from './view/filters-view.js';
import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import PointPresenter from './presenter/point-presenter.js';

import LoadingView from './view/loading-view.js';
import FailedLoadDataView from './view/failed-load-data-view.js';
import ListEmptyView from './view/list-empty-view.js';

import {SortType} from './const.js';

const UiState = {
  LOADING: 'loading',
  ERROR: 'error',
  READY: 'ready',
};

const sortByDay = (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom);

const sortByTime = (a, b) => {
  const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
  const durationB = new Date(b.dateTo) - new Date(b.dateFrom);
  return durationB - durationA; // más largo primero (como en el proyecto)
};

const sortByPrice = (a, b) => b.basePrice - a.basePrice; // más caro primero

export default class Presenter {
  #pointsModel = null;

  #filtersContainer = null;
  #tripEventsContainer = null;

  #sortComponent = null;
  #tripListComponent = null;
  #pointPresenters = new Map();

  #uiState = UiState.READY;

  #loadingComponent = new LoadingView();
  #failedComponent = new FailedLoadDataView();
  #emptyComponent = null;

  #currentSortType = SortType.DAY;

  constructor(pointsModel) {
    this.#pointsModel = pointsModel;

    this.#filtersContainer = document.querySelector('.trip-controls__filters');
    this.#tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    render(new FiltersView(), this.#filtersContainer, RenderPosition.BEFOREEND);

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

    this.#renderSort();
    this.#renderPoints(this.#getSortedPoints(points));
  }

  #renderSort() {
    // если уже отрисовывали сортировку — уберём старую
    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
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

  #clearPointsList() {
    // destroy presenters
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    // remove list component
    if (this.#tripListComponent) {
      remove(this.#tripListComponent);
      this.#tripListComponent = null;
    }
  }

  #renderPoints(points) {
    this.#clearMessages();
    this.#clearPointsList();

    this.#tripListComponent = new TripListView();
    render(this.#tripListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = this.#tripListComponent.getElement();

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

  #getSortedPoints(points) {
    const sorted = [...points];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return sorted.sort(sortByTime);
      case SortType.PRICE:
        return sorted.sort(sortByPrice);
      case SortType.DAY:
      default:
        return sorted.sort(sortByDay);
    }
  }

  #handleSortTypeChange = (sortType) => {
    // 4) не перерисовываем если сортировка не изменилась
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;

    // перерисовать сортировку (чтобы checked обновился)
    this.#renderSort();

    // перерисовать список по новому порядку
    const points = this.#pointsModel?.points ?? [];
    this.#renderPoints(this.#getSortedPoints(points));
  };

  #handlePointModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    // update data in model array
    const points = this.#pointsModel.points;
    const index = points.findIndex((p) => p.id === updatedPoint.id);
    if (index === -1) {
      return;
    }
    points[index] = updatedPoint;

    // re-render only this point (keeps current sort order in DOM as-is)
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
