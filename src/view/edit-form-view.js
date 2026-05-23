// src/view/edit-form-view.js
import AbstractStatefulView from './abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

const DATE_FORMAT = 'DD/MM/YY HH:mm';

const createPointFromState = (state) => state.point;

const shake = (element) => {
  element.style.animation = 'shake 0.6s';
  setTimeout(() => {
    element.style.animation = '';
  }, 600);
};

export default class EditFormView extends AbstractStatefulView {
  #destinations = [];
  #offersByType = {};

  #handleFormSubmit = null;
  #handleRollupClick = null;
  #handleDeleteClick = null;

  #dateFromPicker = null;
  #dateToPicker = null;

  constructor({point, destination, offersByType, destinations, onFormSubmit, onRollupClick, onDeleteClick}) {
    super();

    this.#offersByType = offersByType;
    this.#destinations = destinations;

    this._state = {
      point,
      destination,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };

    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  get template() {
    const {point, destination, isDisabled, isSaving, isDeleting} = this._state;
    const {type, basePrice, dateFrom, dateTo} = point;

    const saveText = isSaving ? 'Saving...' : 'Save';
    const deleteText = isDeleting ? 'Deleting...' : 'Delete';

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

              <select class="event__type-select" name="event-type" ${isDisabled ? 'disabled' : ''}>
                ${Object.keys(this.#offersByType).map((t) => `
                  <option value="${t}" ${t === type ? 'selected' : ''}>${capitalize(t)}</option>
                `).join('')}
              </select>
            </div>

            <div class="event__field-group  event__field-group--destination">
              <label class="event__label  event__type-output">${capitalize(type)}</label>
              <select class="event__input  event__input--destination" name="event-destination" ${isDisabled ? 'disabled' : ''}>
                ${this.#destinations.map((d) => `
                  <option value="${d.id}" ${d.id === point.destinationId ? 'selected' : ''}>
                    ${d.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="event__field-group  event__field-group--time">
              <input
                class="event__input event__input--time"
                type="text"
                name="event-start-time"
                value="${dayjs(dateFrom).format(DATE_FORMAT)}"
                ${isDisabled ? 'disabled' : ''}
              >
              —
              <input
                class="event__input event__input--time"
                type="text"
                name="event-end-time"
                value="${dayjs(dateTo).format(DATE_FORMAT)}"
                ${isDisabled ? 'disabled' : ''}
              >
            </div>

            <div class="event__field-group  event__field-group--price">
              <label class="event__label">€</label>
              <input class="event__input  event__input--price" type="text" name="event-price" value="${basePrice}" ${isDisabled ? 'disabled' : ''}>
            </div>

            <button class="event__save-btn  btn  btn--blue" type="submit" ${isDisabled ? 'disabled' : ''}>${saveText}</button>
            <button class="event__reset-btn" type="button" ${isDisabled ? 'disabled' : ''}>${deleteText}</button>

            <button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
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

  reset(point) {
    const destination = this.#destinations.find((currentDestination) =>
      currentDestination.id === point.destinationId
    );

    this._setState({
      point,
      destination,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });

    this.updateElement();
  }

  _restoreHandlers() {
    const element = this.getElement();

    element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);
    element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);

    element.querySelector('.event__type-select').addEventListener('change', this.#typeChangeHandler);
    element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);

    this.#setDatePickers();
  }

  #setDatePickers() {
    const element = this.getElement();

    const startInput = element.querySelector('input[name="event-start-time"]');
    const endInput = element.querySelector('input[name="event-end-time"]');

    this.#dateFromPicker = flatpickr(startInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.point.dateFrom,
      onChange: this.#dateFromChangeHandler,
    });

    this.#dateToPicker = flatpickr(endInput, {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      defaultDate: this._state.point.dateTo,
      onChange: this.#dateToChangeHandler,
    });
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(createPointFromState(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(createPointFromState(this._state));
  };

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;

    this._setState({
      point: {
        ...this._state.point,
        type: newType,
        offersIds: [],
      },
    });

    this.updateElement();
  };

  #destinationChangeHandler = (evt) => {
    const newDestinationId = evt.target.value;
    const newDestination = this.#destinations.find((d) => d.id === newDestinationId);

    this._setState({
      point: {
        ...this._state.point,
        destinationId: newDestinationId,
      },
      destination: newDestination,
    });

    this.updateElement();
  };

  #priceInputHandler = (evt) => {
    const value = evt.target.value.replace(/[^\d]/g, '');

    this._setState({
      point: {
        ...this._state.point,
        basePrice: Number(value),
      },
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateFrom: userDate,
      },
    });
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      point: {
        ...this._state.point,
        dateTo: userDate,
      },
    });
  };

  setSaving() {
    this._setState({
      isDisabled: true,
      isSaving: true,
      isDeleting: false,
    });

    this.updateElement();
  }

  setDeleting() {
    this._setState({
      isDisabled: true,
      isSaving: false,
      isDeleting: true,
    });

    this.updateElement();
  }

  setAborting() {
    this._setState({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });

    this.updateElement();
    shake(this.getElement());
  }
}
