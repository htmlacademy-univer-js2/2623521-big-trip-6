import AbstractView from './abstract-view.js';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

export default class TripEventView extends AbstractView {
  #point;
  #destination;
  #offers;

  #handleRollupClick;
  #handleFavoriteClick;

  constructor({point, destination, offers, onRollupClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;

    this.#handleRollupClick = onRollupClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.getElement()
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);

    this.getElement()
      .querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };

  get template() {
    const {type, basePrice, dateFrom, dateTo, isFavorite} = this.#point;
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

    const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

    return `
      <li class="trip-events__item">
        <div class="event">
          <time class="event__date" datetime="${start.toISOString()}">${month} ${day}</time>

          <div class="event__type">
            <img class="event__type-icon" width="42" height="42"
              src="img/icons/${type}.png" alt="Event type icon">
          </div>

          <h3 class="event__title">${capitalize(type)} to ${destinationName}</h3>

          <div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${start.toISOString()}">${startTime}</time>
              —
              <time class="event__end-time" datetime="${end.toISOString()}">${endTime}</time>
            </p>
          </div>

          <p class="event__price">
            € <span class="event__price-value">${basePrice}</span>
          </p>

          <div class="event__offers">
            ${offersTemplate}
          </div>

          <button class="event__favorite-btn ${favoriteClass}" type="button">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-7.3 3.8 1.4-8.1L2.3 10.6l8.1-1.2L14 2l3.6 7.4 8.1 1.2-5.8 6.1 1.4 8.1z"></path>
            </svg>
          </button>

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </div>
      </li>
    `;
  }
}
