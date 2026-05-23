import AbstractView from './abstract-view.js';
import {formatTripDates} from '../utils/date.js';

const sortByDay = (a, b) => new Date(a.dateFrom) - new Date(b.dateFrom);

const createTripRoute = (points, destinations) => {
  const sortedPoints = [...points].sort(sortByDay);

  const routeNames = sortedPoints
    .map((point) => destinations.find((destination) => destination.id === point.destinationId)?.name)
    .filter((name) => name);

  if (routeNames.length === 0) {
    return '';
  }

  if (routeNames.length <= 3) {
    return routeNames.join(' — ');
  }

  return `${routeNames[0]} — ... — ${routeNames[routeNames.length - 1]}`;
};

const createTripDates = (points) => {
  const sortedPoints = [...points].sort(sortByDay);

  if (sortedPoints.length === 0) {
    return '';
  }

  const firstPoint = sortedPoints[0];
  const lastPoint = sortedPoints[sortedPoints.length - 1];

  return formatTripDates(firstPoint.dateFrom, lastPoint.dateTo);
};

const calculateTripPrice = (points, offersByType) => points.reduce((total, point) => {
  const pointOffers = offersByType[point.type] ?? [];

  const selectedOffersPrice = pointOffers
    .filter((offer) => point.offersIds.includes(offer.id))
    .reduce((offersTotal, offer) => offersTotal + offer.price, 0);

  return total + point.basePrice + selectedOffersPrice;
}, 0);

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];
  #offersByType = {};

  constructor({points, destinations, offersByType}) {
    super();

    this.#points = points;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
  }

  get template() {
    const tripRoute = createTripRoute(this.#points, this.#destinations);
    const tripDates = createTripDates(this.#points);
    const tripPrice = calculateTripPrice(this.#points, this.#offersByType);

    return `
      <section class="trip-main__trip-info trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${tripRoute}</h1>

          <p class="trip-info__dates">${tripDates}</p>
        </div>

        <p class="trip-info__cost">
          Total: €&nbsp;<span class="trip-info__cost-value">${tripPrice}</span>
        </p>
      </section>
    `;
  }
}
