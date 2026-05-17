import {replace, render, remove, RenderPosition} from '../render.js';
import TripEventView from '../view/trip-event-view.js';
import EditFormView from '../view/edit-form-view.js';
import {UserAction} from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #listContainer = null;

  #destinations = null;
  #offersByType = null;

  #handleModeChange = null;
  #handleAction = null;

  #point = null;
  #destination = null;
  #offers = null;

  #pointComponent = null;
  #editComponent = null;

  #mode = Mode.DEFAULT;

  constructor({listContainer, destinations, offersByType, onModeChange, onAction}) {
    this.#listContainer = listContainer;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this.#handleModeChange = onModeChange;
    this.#handleAction = onAction;
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
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editComponent = new EditFormView({
      point: this.#point,
      destination: this.#destination,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleCloseForm,
      onDeleteClick: this.#handleDeleteClick,
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

  // ⭐ Favorite
  #handleFavoriteClick = () => {
    this.#handleAction(UserAction.UPDATE_POINT, {
      ...this.#point,
      isFavorite: !this.#point.isFavorite,
    });
  };

  // 💾 Save (submit)
  #handleFormSubmit = (updatedPoint) => {
    this.#handleAction(UserAction.UPDATE_POINT, updatedPoint);
    this.#replaceFormToPoint();
  };

  // 🗑 Delete
  #handleDeleteClick = (pointToDelete) => {
    this.#handleAction(UserAction.DELETE_POINT, pointToDelete);
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
