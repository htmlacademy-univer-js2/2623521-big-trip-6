import {render, RenderPosition, remove} from './render.js';

import SortView from './view/sort-view.js';
import TripListView from './view/trip-list-view.js';
import PointPresenter from './presenter/point-presenter.js';
import EditFormView from './view/edit-form-view.js';

import LoadingView from './view/loading-view.js';
import FailedLoadDataView from './view/failed-load-data-view.js';
import ListEmptyView from './view/list-empty-view.js';

import {SortType, FilterType, UserAction} from './const.js';
import dayjs from 'dayjs';

const UiState = {
  LOADING: 'loading',
  ERROR: 'error',
  READY: 'ready',
};

const sortByDay = (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom);

const sortByTime = (a, b) => {
  const durationA = new Date(a.dateTo) - new Date(a.dateFrom);
  const durationB = new Date(b.dateTo) - new Date(b.dateFrom);

  return durationB - durationA;
};

const sortByPrice = (a, b) => b.basePrice - a.basePrice;

export default class Presenter {
  #pointsModel = null;
  #filterModel = null;

  #tripEventsContainer = null;

  #sortComponent = null;
  #tripListComponent = null;
  #pointPresenters = new Map();

  #uiState = UiState.READY;

  #loadingComponent = new LoadingView();
  #failedComponent = new FailedLoadDataView();
  #emptyComponent = null;

  #currentSortType = SortType.DAY;

  #filtersPresenter = null;

  #newEventButton = null;
  #creatingComponent = null;

  constructor({pointsModel, filterModel}) {
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#tripEventsContainer = document.querySelector('.trip-events');

    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  setFiltersPresenter(filtersPresenter) {
    this.#filtersPresenter = filtersPresenter;
  }

  setLoading() {
    this.#uiState = UiState.LOADING;
  }

  setReady() {
    this.#uiState = UiState.READY;
  }

  setError() {
    this.#uiState = UiState.ERROR;
  }

  init() {
    const points = this.#pointsModel.getPoints();

    if (this.#uiState === UiState.LOADING) {
      this.#renderLoading();
      return;
    }

    if (this.#uiState === UiState.ERROR) {
      this.#renderError();
      return;
    }

    this.#renderSort();
    this.#renderByState(points);

    this.#newEventButton.disabled = this.#pointsModel.destinations.length === 0;
  }

  onFilterChange = () => {
    this.#currentSortType = SortType.DAY;
    this.#renderSort();
    this.#renderByState(this.#pointsModel.getPoints());
  };

  #renderByState(points) {
    this.#clearMessages();

    const filteredPoints = this.#getFilteredPoints(points);

    if (filteredPoints.length === 0) {
      this.#clearPointsList();
      this.#renderEmpty();
      return;
    }

    this.#renderPoints(this.#getSortedPoints(filteredPoints));
  }

  #renderSort() {
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
    this.#tripEventsContainer
      .querySelectorAll('.trip-events__msg')
      .forEach((node) => node.remove());

    remove(this.#loadingComponent);
    remove(this.#failedComponent);

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
  }

  #renderLoading() {
    this.#clearMessages();
    this.#clearPointsList();
    render(this.#loadingComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderError() {
    this.#clearMessages();
    this.#clearPointsList();
    render(this.#failedComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #renderEmpty() {
    this.#clearMessages();

    const filterType = this.#filterModel.getFilter();

    this.#emptyComponent = new ListEmptyView({filterType});
    render(this.#emptyComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

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
        destinations: this.#pointsModel.destinations,
        offersByType: this.#pointsModel.offersByType,
        onModeChange: this.#handlePointModeChange,
        onAction: this.#handleViewAction,
      });

      pointPresenter.init({point, destination, offers});
      this.#pointPresenters.set(point.id, pointPresenter);
    }
  }

  #getFilteredPoints(points) {
    const filterType = this.#filterModel.getFilter();
    const now = dayjs();

    switch (filterType) {
      case FilterType.FUTURE:
        return points.filter((point) => dayjs(point.dateFrom).isAfter(now));
      case FilterType.PAST:
        return points.filter((point) => dayjs(point.dateTo).isBefore(now));
      case FilterType.PRESENT:
        return points.filter((point) =>
          dayjs(point.dateFrom).isBefore(now) && dayjs(point.dateTo).isAfter(now)
        );
      case FilterType.EVERYTHING:
      default:
        return points;
    }
  }

  #getSortedPoints(points) {
    const sortedPoints = [...points];

    switch (this.#currentSortType) {
      case SortType.TIME:
        return sortedPoints.sort(sortByTime);
      case SortType.PRICE:
        return sortedPoints.sort(sortByPrice);
      case SortType.DAY:
      default:
        return sortedPoints.sort(sortByDay);
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderSort();
    this.#renderByState(this.#pointsModel.getPoints());
  };

  #handlePointModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#creatingComponent) {
      remove(this.#creatingComponent);
      this.#creatingComponent = null;
      this.#newEventButton.disabled = false;
    }
  };

  #handleViewAction = async (actionType, update, pointPresenter) => {
    try {
      switch (actionType) {
        case UserAction.UPDATE_POINT:
          pointPresenter?.setSaving();
          await this.#pointsModel.updatePoint(update);
          break;

        case UserAction.DELETE_POINT:
          pointPresenter?.setDeleting();
          await this.#pointsModel.deletePoint(update.id);
          break;

        case UserAction.ADD_POINT:
          this.#creatingComponent?.setSaving();
          await this.#pointsModel.addPoint(update);
          this.#creatingComponent = null;
          this.#newEventButton.disabled = false;
          break;

        default:
          break;
      }

      this.#renderByState(this.#pointsModel.getPoints());
    } catch (err) {
      if (actionType === UserAction.ADD_POINT) {
        this.#creatingComponent?.setAborting();
        return;
      }

      pointPresenter?.setAborting();
    }
  };

  #handleNewEventClick = () => {
    if (this.#pointsModel.destinations.length === 0 || this.#creatingComponent) {
      return;
    }

    this.#handlePointModeChange();

    this.#filterModel.setFilter(FilterType.EVERYTHING);
    this.#currentSortType = SortType.DAY;

    this.#filtersPresenter?.init();
    this.#renderSort();
    this.#renderByState(this.#pointsModel.getPoints());

    this.#clearMessages();

    if (!this.#tripListComponent) {
      this.#tripListComponent = new TripListView();
      render(this.#tripListComponent, this.#tripEventsContainer, RenderPosition.BEFOREEND);
    }

    const listElement = this.#tripListComponent.getElement();

    const now = new Date();
    const defaultDestination = this.#pointsModel.destinations[0];

    const newPoint = {
      type: 'taxi',
      destinationId: defaultDestination.id,
      offersIds: [],
      basePrice: 0,
      dateFrom: now,
      dateTo: new Date(now.getTime() + 60 * 60 * 1000),
      isFavorite: false,
    };

    this.#newEventButton.disabled = true;

    this.#creatingComponent = new EditFormView({
      point: newPoint,
      destination: defaultDestination,
      destinations: this.#pointsModel.destinations,
      offersByType: this.#pointsModel.offersByType,

      onFormSubmit: (createdPoint) => {
        this.#handleViewAction(UserAction.ADD_POINT, createdPoint, null);
      },

      onRollupClick: () => {
        this.#newEventButton.disabled = false;
        remove(this.#creatingComponent);
        this.#creatingComponent = null;
        this.#renderByState(this.#pointsModel.getPoints());
      },

      onDeleteClick: () => {
        this.#newEventButton.disabled = false;
        remove(this.#creatingComponent);
        this.#creatingComponent = null;
        this.#renderByState(this.#pointsModel.getPoints());
      },
    });

    render(this.#creatingComponent, listElement, RenderPosition.AFTERBEGIN);
  };
}
