import AbstractView from './abstract-view.js';

export default class AbstractStatefulView extends AbstractView {
  _state = {};

  updateElement() {
    const prevElement = this.getElement();
    const parent = prevElement.parentElement;

    this.removeElement();
    const newElement = this.getElement();

    if (parent === null) {
      return;
    }

    prevElement.replaceWith(newElement);
    this._restoreHandlers();
  }

  _setState(update) {
    this._state = {
      ...this._state,
      ...update,
    };
  }

  _restoreHandlers() {
    throw new Error('Abstract method not implemented: _restoreHandlers');
  }
}
