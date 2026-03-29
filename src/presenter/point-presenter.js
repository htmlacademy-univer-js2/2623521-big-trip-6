import {replace, render, remove, RenderPosition} from '../render.js';
import TripEventView from '../view/trip-event-view.js';
import EditFormView from '../view/edit-form-view.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #listContainer = null;
  #handleModeChange = null;

  #point = null;
  #destination = null;
  #offers = null;

  #pointComponent = null;
  #editComponent = null;

  #mode = Mode.DEFAULT;

  constructor({listContainer, onModeChange}) {
    this.#listContainer = listContainer;
    this.#handleModeChange = onModeChange;
  }

  init({point, destination, offers}) {
    this.#point = point;
    this.#destination = destination;
    this.#offers = offers;

    const prevPointComponent = this.#pointComponent;
    const prevEditComponent = this.#editComponent;

    this.#pointComponent = new TripEventView({
      point: this.#point,
      destination: this.#destination,
      offers: this.#offers,
      onRollupClick: this.#handleOpenForm,
    });

    this.#editComponent = new EditFormView({
      point: this.#point,
      destination: this.#destination,
      onFormSubmit: this.#handleCloseForm,
      onRollupClick: this.#handleCloseForm,
    });

    if (prevPointComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#listContainer, RenderPosition.BEFOREEND);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#editComponent, prevEditComponent);
    }

    remove(prevPointComponent);
    remove(prevEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  #handleOpenForm = () => {
    this.#handleModeChange();
    this.#replacePointToForm();
  };

  #handleCloseForm = () => {
    this.#replaceFormToPoint();
  };

  #replacePointToForm() {
    replace(this.#editComponent, this.#pointComponent);
    this.#mode = Mode.EDITING;
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#editComponent);
    this.#mode = Mode.DEFAULT;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };
}
