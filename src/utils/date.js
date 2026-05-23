import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const formatEventDate = (date) => dayjs(date).format('MMM DD').toUpperCase();

const formatEventTime = (date) => dayjs(date).format('HH:mm');

const formatDuration = (dateFrom, dateTo) => {
  const diffMs = dayjs(dateTo).diff(dayjs(dateFrom));
  const durationValue = dayjs.duration(diffMs);

  const days = Math.floor(durationValue.asDays());
  const hours = durationValue.hours();
  const minutes = durationValue.minutes();

  if (diffMs < 60 * 60 * 1000) {
    return `${minutes}M`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    if (minutes === 0) {
      return `${String(hours).padStart(2, '0')}H`;
    }

    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  const dayPart = `${String(days).padStart(2, '0')}D`;
  const hourPart = hours ? ` ${String(hours).padStart(2, '0')}H` : '';
  const minutePart = minutes ? ` ${String(minutes).padStart(2, '0')}M` : '';

  return `${dayPart}${hourPart}${minutePart}`.trim();
};

const formatTripDates = (dateFrom, dateTo) => {
  const startDate = dayjs(dateFrom);
  const endDate = dayjs(dateTo);

  if (startDate.isSame(endDate, 'month')) {
    return `${startDate.format('MMM DD')} — ${endDate.format('DD')}`.toUpperCase();
  }

  return `${startDate.format('MMM DD')} — ${endDate.format('MMM DD')}`.toUpperCase();
};

export {formatEventDate, formatEventTime, formatDuration, formatTripDates};
