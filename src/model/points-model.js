// src/model/points-model.js

export default class PointsModel {
  #points = [];
  #destinations = [];
  #offersByType = {};

  constructor({points, destinations, offersByType}) {
    this.#points = points;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  // getters (por compatibilidad)
  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offersByType() {
    return this.#offersByType;
  }

  // los que pide 7/8 (y los usa tu Presenter)
  getPoints() {
    return this.#points;
  }

  setPoints(points) {
    this.#points = points;
  }

  setDestinations(destinations) {
    this.#destinations = destinations;
  }

  setOffersByType(offersByType) {
    this.#offersByType = offersByType;
  }

  updatePoint(updatedPoint) {
    this.#points = this.#points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );
  }

  // helpers
  getDestinationById(id) {
    return this.#destinations.find((d) => d.id === id);
  }

  getOffersByType(type) {
    return this.#offersByType[type] ?? [];
  }
}
