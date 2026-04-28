import AbstractStatefulView from './abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

export default class EditFormView extends AbstractStatefulView {
  #destinations = [];
  #offersByType = {};

  #handleFormSubmit = null;
  #handleRollupClick = null;

  #datepickerFrom = null;
  #datepickerTo = null;

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
                ${Object.keys(this.#offersByType).map((t) => `
                  <option value="${t}" ${t === type ? 'selected' : ''}>${capitalize(t)}</option>
                `).join('')}
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
              <label class="visually-hidden" for="event-start-time-1">From</label>
              <input
                class="event__input  event__input--time"
                id="event-start-time-1"
                type="text"
                name="event-start-time"
                value="${dateFrom}">
              —
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input
                class="event__input  event__input--time"
                id="event-end-time-1"
                type="text"
                name="event-end-time"
                value="${dateTo}">
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

    element.querySelector('.event__type-select').addEventListener('change', this.#typeChangeHandler);
    element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);

    this.#setDatepickers();
  }

  #setDatepickers() {
    const element = this.getElement();

    const startInput = element.querySelector('#event-start-time-1');
    const endInput = element.querySelector('#event-end-time-1');

    if (!startInput || !endInput) {
      return;
    }

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }

    this.#datepickerFrom = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.point.dateFrom,
      onChange: ([userDate]) => {
        this._state = {
          ...this._state,
          point: {
            ...this._state.point,
            dateFrom: userDate,
          },
        };
      },
    });

    this.#datepickerTo = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.point.dateTo,
      onChange: ([userDate]) => {
        this._state = {
          ...this._state,
          point: {
            ...this._state.point,
            dateTo: userDate,
          },
        };
      },
    });
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
