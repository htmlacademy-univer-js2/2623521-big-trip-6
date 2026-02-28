import Presenter from './presenter.js';
import PointsModel from './model/points-model.js';
import { destinations, offersByType, generatePoints } from './mock/mock.js';

const pointsModel = new PointsModel({
  points: generatePoints(3),
  destinations,
  offersByType,
});

const presenter = new Presenter(pointsModel);
presenter.init();
