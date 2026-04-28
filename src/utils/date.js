import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

// Formato de fecha para la columna DAY: "APR 28"
const formatEventDate = (date) => dayjs(date).format('MMM DD').toUpperCase();

// Formato hora: "10:30"
const formatEventTime = (date) => dayjs(date).format('HH:mm');

// Duración según TЗ:
// < 1h: "23M"
// < 1d: "02H 44M" (si minutos 0 -> "12H")
// >= 1d: "01D 02H 30M" (si H o M 0 se pueden omitir)
const formatDuration = (dateFrom, dateTo) => {
  const diffMs = dayjs(dateTo).diff(dayjs(dateFrom));
  const d = dayjs.duration(diffMs);

  const days = Math.floor(d.asDays());
  const hours = d.hours();
  const minutes = d.minutes();

  if (diffMs < 60 * 60 * 1000) {
    return `${minutes}M`;
  }

  if (diffMs < 24 * 60 * 60 * 1000) {
    if (minutes === 0) {
      return `${String(hours).padStart(2, '0')}H`;
    }
    return `${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
  }

  // >= 1 día
  const dayPart = `${String(days).padStart(2, '0')}D`;
  const hourPart = hours ? ` ${String(hours).padStart(2, '0')}H` : '';
  const minPart = minutes ? ` ${String(minutes).padStart(2, '0')}M` : '';
  return `${dayPart}${hourPart}${minPart}`.trim();
};

export {formatEventDate, formatEventTime, formatDuration};
