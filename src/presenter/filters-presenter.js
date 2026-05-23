import {render, RenderPosition, remove} from '../render.js';
import FiltersView from '../view/filters-view.js';
import {FilterType} from '../const.js';
import dayjs from 'dayjs';

const getDisabledFilters = (points) => {
  const now = dayjs();

  return {
    [FilterType.EVERYTHING]: points.length === 0,
    [FilterType.FUTURE]: !points.some((point) => dayjs(point.dateFrom).isAfter(now)),
    [FilterType.PRESENT]: !points.some((point) =>
      dayjs(point.dateFrom).isBefore(now) && dayjs(point.dateTo).isAfter(now)
    ),
    [FilterType.PAST]: !points.some((point) => dayjs(point.dateTo).isBefore(now)),
  };
};

export default class FiltersPresenter {
  #filtersContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #handleFilterChange = null;

  #filtersComponent = null;

  constructor({filtersContainer, pointsModel, filterModel, onFilterChange}) {
    this.#filtersContainer = filtersContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#handleFilterChange = onFilterChange;
  }

  init() {
    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }

    this.#filtersComponent = new FiltersView({
      currentFilterType: this.#filterModel.getFilter(),
      disabledFilters: getDisabledFilters(this.#pointsModel.getPoints()),
      onFilterChange: this.#filterChangeHandler,
    });

    render(this.#filtersComponent, this.#filtersContainer, RenderPosition.BEFOREEND);
  }

  #filterChangeHandler = (filterType) => {
    if (this.#filterModel.getFilter() === filterType) {
      return;
    }

    this.#filterModel.setFilter(filterType);
    this.#handleFilterChange(filterType);

    this.init();
  };
}
