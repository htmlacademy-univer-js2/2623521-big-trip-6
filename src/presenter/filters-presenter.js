import {render, RenderPosition, remove} from '../render.js';
import FiltersView from '../view/filters-view.js';

export default class FiltersPresenter {
  #filtersContainer = null;
  #filterModel = null;
  #handleFilterChange = null;

  #filtersComponent = null;

  constructor({filtersContainer, filterModel, onFilterChange}) {
    this.#filtersContainer = filtersContainer;
    this.#filterModel = filterModel;
    this.#handleFilterChange = onFilterChange;
  }

  init() {
    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }

    this.#filtersComponent = new FiltersView({
      currentFilterType: this.#filterModel.getFilter(),
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

    // перерисуем фильтры, чтобы checked был правильный
    this.init();
  };
}
