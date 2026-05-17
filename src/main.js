import Presenter from './presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FiltersPresenter from './presenter/filters-presenter.js';

import {destinations, offersByType, generatePoints} from './mock/mock.js';

const pointsModel = new PointsModel({
  points: generatePoints(3),
  destinations,
  offersByType,
});

const filterModel = new FilterModel();

const presenter = new Presenter({pointsModel, filterModel});
presenter.init();

const filtersContainer = document.querySelector('.trip-controls__filters');

const filtersPresenter = new FiltersPresenter({
  filtersContainer,
  filterModel,
  onFilterChange: presenter.onFilterChange,
});

filtersPresenter.init();
