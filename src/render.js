const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

function createElement(template) {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;
  return newElement.firstElementChild;
}

function render(component, container, place = RenderPosition.BEFOREEND) {
  container.insertAdjacentElement(place, component.getElement());
}

function replace(newComponent, oldComponent) {
  const newElement = newComponent.getElement();
  const oldElement = oldComponent.getElement();

  if (!oldElement.parentElement || newElement === oldElement) {
    return;
  }

  oldElement.parentElement.replaceChild(newElement, oldElement);
}

function remove(component) {
  component.getElement().remove();
  component.removeElement();
}

export {RenderPosition, createElement, render, replace, remove};