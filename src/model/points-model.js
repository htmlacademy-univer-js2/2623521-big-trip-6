export default class PointsModel {
  #apiService = null;
  #points = [];
  #destinations = [];
  #offersByType = {};

  constructor({apiService, points, destinations, offersByType}) {
    this.#apiService = apiService;
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

  async addPoint(point) {
    const createdPoint = await this.#apiService.addPoint(point);

    this.#points = [createdPoint, ...this.#points];

    return createdPoint;
  }

  async updatePoint(point) {
    const updatedPoint = await this.#apiService.updatePoint(point);

    this.#points = this.#points.map((currentPoint) =>
      currentPoint.id === updatedPoint.id ? updatedPoint : currentPoint
    );

    return updatedPoint;
  }

  async deletePoint(pointId) {
    await this.#apiService.deletePoint(pointId);

    this.#points = this.#points.filter((point) => point.id !== pointId);
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    return this.#offersByType[type] ?? [];
  }
}
