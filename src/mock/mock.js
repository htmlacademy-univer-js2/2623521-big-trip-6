import { nanoid } from 'nanoid';

const pointTypes = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

const destinations = [
  {
    id: 'dest1',
    name: 'Amsterdam',
    description: 'Amsterdam is the capital of the Netherlands.',
    pictures: [
      { src: 'img/photos/1.jpg', description: 'Amsterdam' },
      { src: 'img/photos/2.jpg', description: 'Amsterdam canal' }
    ],
  },
  {
    id: 'dest2',
    name: 'Chamonix',
    description: 'Chamonix is a resort area near Mont Blanc.',
    pictures: [
      { src: 'img/photos/3.jpg', description: 'Chamonix' }
    ],
  },
];

const offersByType = {
  taxi: [
    { id: 'o1', title: 'Order Uber', price: 20 },
    { id: 'o2', title: 'Switch to comfort', price: 80 },
  ],
  flight: [
    { id: 'o3', title: 'Add luggage', price: 50 },
    { id: 'o4', title: 'Business class', price: 120 },
  ],
};

const getRandomItem = (items) => items[Math.floor(Math.random() * items.length)];

const generatePoint = () => {
  const type = getRandomItem(pointTypes);
  const destination = getRandomItem(destinations);
  const possibleOffers = offersByType[type] ?? [];
  const offersIds = possibleOffers.slice(0, 1).map((o) => o.id);

  const dateFrom = new Date();
  const dateTo = new Date(dateFrom.getTime() + 30 * 60 * 1000);

  return {
    id: nanoid(),
    type,
    destinationId: destination.id,
    offersIds,
    basePrice: 20,
    dateFrom,
    dateTo,
    isFavorite: false,
  };
};

const generatePoints = (count = 3) => Array.from({ length: count }, generatePoint);

export { destinations, offersByType, generatePoints };
