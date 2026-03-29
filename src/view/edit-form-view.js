import AbstractView from './abstract-view.js';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

export default class EditFormView extends AbstractView {
  #point;
  #destination;

  #handleFormSubmit;
  #handleRollupClick;

  constructor({point, destination, onFormSubmit, onRollupClick}) {
    super();
    this.#point = point;
    this.#destination = destination;

    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;

    this.getElement()
      .querySelector('.event__save-btn')
      .addEventListener('click', this.#formSubmitHandler);

    this.getElement()
      .querySelector('.event__rollup-btn')
      .addEventListener('click', this.#rollupClickHandler);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  get template() {
    const {type, basePrice, dateFrom, dateTo} = this.#point;
    const destinationName = this.#destination?.name ?? '';

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type event__type-btn" for="event-type-toggle-1">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17"
                  src="img/icons/${type}.png"
                  alt="Event type icon">
              </label>
              <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            </div>

            <div class="event__field-group event__field-group--destination">
              <label class="event__label event__type-output" for="event-destination-1">${capitalize(type)}</label>
              <input class="event__input event__input--destination"
                id="event-destination-1"
                type="text"
                name="event-destination"
                value="${destinationName}">
            </div>

            <div class="event__field-group event__field-group--time">
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input class="event__input event__input--time"
                id="event-start-time-1"
                type="text"
                name="event-start-time"
                value="${formatTime(dateFrom)}">
              —
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input event__input--time"
                id="event-end-time-1"
                type="text"
                name="event-end-time"
                value="${formatTime(dateTo)}">
            </div>

            <div class="event__field-group event__field-group--price">
              <label class="event__label" for="event-price-1">€</label>
              <input class="event__input event__input--price"
                id="event-price-1"
                type="text"
                name="event-price"
                value="${basePrice}">
            </div>

            <button class="event__save-btn btn btn--blue" type="button">Save</button>
            <button class="event__reset-btn" type="reset">Delete</button>

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>
        </form>
      </li>
    `;
  }
}
