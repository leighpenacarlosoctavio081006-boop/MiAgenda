import { formatLocalDateISO } from '../data/sampleData';

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const WEEKDAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function getTodayISO(): string {
  return formatLocalDateISO(new Date());
}

export function formatFriendlyDate(iso: string): string {
  const todayISO = getTodayISO();
  const today = parseISODate(todayISO);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

  if (iso === todayISO) return 'Hoy';
  if (iso === formatLocalDateISO(tomorrow)) return 'Mañana';
  if (iso === formatLocalDateISO(yesterday)) return 'Ayer';

  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function formatLongSpanishDate(iso: string): string {
  const d = parseISODate(iso);
  const weekday = WEEKDAYS_LONG[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_LONG[d.getMonth()];
  return `${weekday} ${day} de ${month}`;
}

export function getWeekDates(anchorISO: string): {
  iso: string;
  dayShort: string;
  dayNumber: number;
  monthShort: string;
}[] {
  const anchor = parseISODate(anchorISO);
  const dayOfWeek = anchor.getDay(); // 0 = Sun, 1 = Mon
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    days.push({
      iso: formatLocalDateISO(current),
      dayShort: WEEKDAYS_SHORT[current.getDay()],
      dayNumber: current.getDate(),
      monthShort: MONTHS_SHORT[current.getMonth()],
    });
  }
  return days;
}

export function shiftISOByDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  const shifted = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  return formatLocalDateISO(shifted);
}
