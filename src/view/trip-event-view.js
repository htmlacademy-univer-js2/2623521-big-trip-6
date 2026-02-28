import AbstractView from './abstract-view';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

export default class TripEventView extends AbstractView {
  #point;
  #destination;
  #offers;

  constructor({point, destination, offers}) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;
  }

  get template() {
    const {type, basePrice, dateFrom, dateTo} = this.#point;
    const destinationName = this.#destination?.name ?? '';

    const start = new Date(dateFrom);
    const end = new Date(dateTo);

    const startTime = start.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
    const endTime = end.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

    const month = start.toLocaleString('en-US', {month: 'short'}).toUpperCase();
    const day = String(start.getDate()).padStart(2, '0');

    const offersTemplate = this.#offers.length
      ? `<h4 class="visually-hidden">Offers:</h4>
         <ul class="event__selected-offers">
           ${this.#offers.map((offer) => `
             <li class="event__offer">
               <span class="event__offer-title">${offer.title}</span>
               +€&nbsp;<span class="event__offer-price">${offer.price}</span>
             </li>
           `).join('')}
         </ul>`
      : '';

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${dateFrom}">${month} ${day}</time>

          <div class="event__type">
            <img class="event__type-icon" width="42" height="42"
              src="img/icons/${type}.png" alt="Event type icon">
          </div>

          <h3 class="event__title">${capitalize(type)} to ${destinationName}</h3>

          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${dateFrom}">${startTime}</time>
              —
              <time class="event__end-time" datetime="${dateTo}">${endTime}</time>
            </p>
          </div>

          <p class="event__price">
            € <span class="event__price-value">${basePrice}</span>
          </p>

          <div class="event__offers">
            ${offersTemplate}
          </div>

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }
}
