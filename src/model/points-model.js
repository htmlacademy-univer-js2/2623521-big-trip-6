export default class PointsModel {
  #points = [];
  #destinations = [];
  #offersByType = {};

  constructor({ points, destinations, offersByType }) {
    this.#points = points;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offersByType() {
    return this.#offersByType;
  }

  getDestinationById(id) {
    return this.#destinations.find((d) => d.id === id);
  }

  getOffersByType(type) {
    return this.#offersByType[type] ?? [];
  }
}
