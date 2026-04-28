import AbstractStatefulView from './abstract-stateful-view.js';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);
const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

export default class EditFormView extends AbstractStatefulView {
  #destinations = [];
  #offersByType = {};

  #handleFormSubmit = null;
  #handleRollupClick = null;

  constructor({point, destination, offersByType, destinations, onFormSubmit, onRollupClick}) {
    super();

    this.#offersByType = offersByType;
    this.#destinations = destinations;

    this._state = {
      point,
      destination,
      offers: (offersByType[point.type] ?? []).filter((o) => point.offersIds.includes(o.id)),
    };

    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;

    this._restoreHandlers();
  }

  get template() {
    const {point, destination} = this._state;
    const {type, basePrice, dateFrom, dateTo} = point;

    return `
      <li class="trip-events__item">
        <form class="event event--edit" action="#" method="post">
          <header class="event__header">
            <div class="event__type-wrapper">
              <label class="event__type  event__type-btn">
                <span class="visually-hidden">Choose event type</span>
                <img class="event__type-icon" width="17" height="17"
                  src="img/icons/${type}.png" alt="Event type icon">
              </label>

              <select class="event__type-select">
                ${Object.keys(this.#offersByType).length
    ? Object.keys(this.#offersByType).map((t) => `
                    <option value="${t}" ${t === type ? 'selected' : ''}>${capitalize(t)}</option>
                  `).join('')
    : ''
}
              </select>
            </div>

            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output">${capitalize(type)}</label>
              <select class="event__input  event__input--destination">
                ${this.#destinations.map((d) => `
                  <option value="${d.id}" ${d.id === point.destinationId ? 'selected' : ''}>
                    ${d.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="event__field-group  event__field-group--time">
              <input class="event__input  event__input--time" type="text" value="${formatTime(dateFrom)}" disabled>
              —
              <input class="event__input  event__input--time" type="text" value="${formatTime(dateTo)}" disabled>
            </div>

            <div class="event__field-group  event__field-group--price">
              <label class="event__label">€</label>
              <input class="event__input  event__input--price" type="text" value="${basePrice}">
            </div>

            <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
            <button class="event__reset-btn" type="reset">Delete</button>

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </header>

          <section class="event__details">
            <section class="event__section  event__section--destination">
              <h3 class="event__section-title  event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${destination?.description ?? ''}</p>
            </section>
          </section>
        </form>
      </li>
    `;
  }

  _restoreHandlers() {
    const element = this.getElement();

    element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);

    element.querySelector('.event__type-select')?.addEventListener('change', this.#typeChangeHandler);
    element.querySelector('.event__input--destination')?.addEventListener('change', this.#destinationChangeHandler);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;

    // меняем тип + сбрасываем offersIds (как говорит задание)
    const newPoint = {
      ...this._state.point,
      type: newType,
      offersIds: [],
    };

    this._state = {
      ...this._state,
      point: newPoint,
      offers: [],
    };

    this.updateElement();
  };

  #destinationChangeHandler = (evt) => {
    const newDestinationId = evt.target.value;
    const newDestination = this.#destinations.find((d) => d.id === newDestinationId);

    const newPoint = {
      ...this._state.point,
      destinationId: newDestinationId,
    };

    this._state = {
      ...this._state,
      point: newPoint,
      destination: newDestination,
    };

    this.updateElement();
  };
}
