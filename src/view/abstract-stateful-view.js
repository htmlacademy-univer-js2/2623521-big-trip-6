import AbstractView from './abstract-view.js';

export default class AbstractStatefulView extends AbstractView {
  _state = {};

  updateElement() {
    const prevElement = this.getElement();
    const parent = prevElement.parentElement;

    this.removeElement();

    const newElement = this.getElement();

    if (parent) {
      parent.replaceChild(newElement, prevElement);
    }

    this._restoreHandlers();
  }

  _restoreHandlers() {
    // to be implemented in child classes
  }
}
