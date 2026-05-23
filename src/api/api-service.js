const adaptPointToClient = (point) => ({
  id: point.id,
  type: point.type,
  destinationId: point.destination,
  offersIds: point.offers,
  basePrice: point.base_price,
  dateFrom: point.date_from ? new Date(point.date_from) : null,
  dateTo: point.date_to ? new Date(point.date_to) : null,
  isFavorite: point.is_favorite,
});

const adaptPointToServer = (point) => ({
  id: point.id,
  type: point.type,
  destination: point.destinationId,
  offers: point.offersIds,
  'base_price': point.basePrice,
  'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : point.dateFrom,
  'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : point.dateTo,
  'is_favorite': point.isFavorite,
});

const adaptOffersToClient = (offersFromServer) => {
  const offersByType = {};

  offersFromServer.forEach((block) => {
    offersByType[block.type] = block.offers;
  });

  return offersByType;
};

export default class ApiService {
  #endPoint = null;
  #authorization = null;

  constructor({endPoint, authorization}) {
    this.#endPoint = endPoint;
    this.#authorization = authorization;
  }

  async #load({url, method = 'GET', body = null, headers = new Headers()}) {
    headers.set('Authorization', this.#authorization);

    const response = await fetch(`${this.#endPoint}/${url}`, {
      method,
      body,
      headers,
    });

    if (!response.ok) {
      throw new Error(`${method} ${url} failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async getPoints() {
    const response = await this.#load({url: 'points'});
    const points = await response.json();

    return points.map(adaptPointToClient);
  }

  async getDestinations() {
    const response = await this.#load({url: 'destinations'});

    return response.json();
  }

  async getOffers() {
    const response = await this.#load({url: 'offers'});
    const offers = await response.json();

    return adaptOffersToClient(offers);
  }

  async updatePoint(point) {
    const response = await this.#load({
      url: `points/${point.id}`,
      method: 'PUT',
      body: JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const updatedPoint = await response.json();

    return adaptPointToClient(updatedPoint);
  }

  async addPoint(point) {
    const response = await this.#load({
      url: 'points',
      method: 'POST',
      body: JSON.stringify(adaptPointToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const createdPoint = await response.json();

    return adaptPointToClient(createdPoint);
  }

  async deletePoint(pointId) {
    await this.#load({
      url: `points/${pointId}`,
      method: 'DELETE',
    });
  }
}
