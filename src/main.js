import Presenter from './presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FiltersPresenter from './presenter/filters-presenter.js';
import ApiService from './api/api-service.js';

const END_POINT = 'https://24.objects.htmlacademy.pro/big-trip';
const AUTHORIZATION = `Basic ${Math.random().toString(36).slice(2)}`;

const apiService = new ApiService({
  endPoint: END_POINT,
  authorization: AUTHORIZATION,
});

const pointsModel = new PointsModel({
  apiService,
  points: [],
  destinations: [],
  offersByType: {},
});

const filterModel = new FilterModel();

const presenter = new Presenter({pointsModel, filterModel});

const filtersPresenter = new FiltersPresenter({
  filtersContainer: document.querySelector('.trip-controls__filters'),
  filterModel,
  onFilterChange: presenter.onFilterChange,
});

filtersPresenter.init();
presenter.setFiltersPresenter(filtersPresenter);

presenter.setLoading();
presenter.init();

Promise.all([
  apiService.getPoints(),
  apiService.getDestinations(),
  apiService.getOffers(),
])
  .then(([points, destinations, offersByType]) => {
    pointsModel.setPoints(points);
    pointsModel.setDestinations(destinations);
    pointsModel.setOffersByType(offersByType);

    presenter.setReady();
    presenter.init();
  })
  .catch(() => {
    presenter.setError();
    presenter.init();
  });
