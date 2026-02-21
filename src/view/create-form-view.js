import AbstractView from './abstract-view';

export default class CreateFormView extends AbstractView {
  get template() {
    return `
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <h3 style="margin: 0;">Create new event (stub)</h3>
        </header>
      </form>
    `;
  }
}
