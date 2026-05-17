export default class PointsModel {
  #points = [];
  #destinations = [];
  #offersByType = {};

  constructor({points, destinations, offersByType}) {
    this.#points = points;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  // ✅ Métodos requeridos para la 7.10
  getPoints() {
    return [...this.#points];
  }

  setPoints(points) {
    this.#points = points;
  }

  updatePoint(updatedPoint) {
    this.#points = this.#points.map((point) =>
      point.id === updatedPoint.id ? updatedPoint : point
    );
  }

  // (Esto lo dejas también si lo estabas usando)
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
