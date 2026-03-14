/* ═══ ID generation ═══ */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Get today's date as YYYY-MM-DD in local timezone.
 * Use this instead of new Date().toISOString().slice(0,10) which uses UTC.
 */
export function toLocalDateString(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string as local time (not UTC).
 * new Date('2026-03-04') → UTC midnight → wrong day in UTC-3.
 * This splits the string and constructs a local Date.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  return new Date(y, m - 1, d || 1);
}

/* ═══ Month helpers ═══ */
export function getMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthKey(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

/* ═══ Currency formatting ═══ */
export function formatCurrency(amount, currency) {
  if (currency === 'USD')
    return `U$D ${Number(amount).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  return `$ ${Number(amount).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/* ═══ localStorage ═══ */
export function loadState(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function saveState(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* storage full */
  }
}

/* ═══ CFTEA → monthly installment calculation ═══ */

/**
 * Convert CFTEA (annual %) to effective monthly rate.
 * e.g. CFTEA 120% → monthlyRate ≈ 0.0696 (6.96%)
 */
export function cfteaToMonthlyRate(cftea) {
  if (!cftea || cftea <= 0) return 0;
  return Math.pow(1 + cftea / 100, 1 / 12) - 1;
}

/**
 * French amortization: equal installments.
 * Returns the fixed monthly payment amount.
 * If rate is 0, simply divides total by number.
 */
export function calculateInstallmentAmount(totalAmount, numInstallments, cfteaPercent) {
  if (numInstallments <= 0) return 0;
  const r = cfteaToMonthlyRate(cfteaPercent);
  if (r === 0) return Math.round(totalAmount / numInstallments);
  // PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const factor = Math.pow(1 + r, numInstallments);
  return Math.round((totalAmount * r * factor) / (factor - 1));
}

/* ═══ Navigable time filter system ═══ */

const MONTHS_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/**
 * Get the date range [start, end) for a given period + offset.
 * offset=0 means current (today, this week, this month, this year).
 * offset=-1 means previous, offset=+1 means next, etc.
 */
export function getDateRange(period, offset = 0) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (period === 'all') return { start: null, end: null };

  if (period === 'day') {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (period === 'week') {
    const d = new Date(now);
    // Start of current week (Monday)
    const dayOfWeek = d.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    d.setDate(d.getDate() + mondayOffset + offset * 7);
    const start = new Date(d);
    const end = new Date(d);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  if (period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const start = new Date(d);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return { start, end };
  }

  if (period === 'year') {
    const y = now.getFullYear() + offset;
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);
    return { start, end };
  }

  return { start: null, end: null };
}

/**
 * Get human-readable label for the current period + offset.
 */
export function getDateLabel(period, offset = 0) {
  const now = new Date();

  if (period === 'all') return 'Histórico';

  if (period === 'day') {
    if (offset === 0) return 'Hoy';
    if (offset === -1) return 'Ayer';
    if (offset === 1) return 'Mañana';
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return `${d.getDate()} de ${MONTHS_FULL[d.getMonth()]}`;
  }

  if (period === 'week') {
    const { start, end } = getDateRange('week', offset);
    const endDay = new Date(end);
    endDay.setDate(endDay.getDate() - 1);
    if (offset === 0) return 'Esta semana';
    if (offset === -1) return 'Semana pasada';
    if (offset === 1) return 'Próxima semana';
    return `${start.getDate()} ${MONTHS_FULL[start.getMonth()].slice(0, 3)} - ${endDay.getDate()} ${MONTHS_FULL[endDay.getMonth()].slice(0, 3)}`;
  }

  if (period === 'month') {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
  }

  if (period === 'year') {
    return `${now.getFullYear() + offset}`;
  }

  return '';
}

/**
 * Filter items by the date range defined by period + offset.
 */
export function filterByDateRange(items, period, offset = 0, dateField = 'date') {
  if (period === 'all') return items;
  const { start, end } = getDateRange(period, offset);
  if (!start || !end) return items;

  return items.filter((item) => {
    const d = parseLocalDate(item[dateField]);
    d.setHours(0, 0, 0, 0);
    return d >= start && d < end;
  });
}

/* ═══ Category helpers (V2 format) ═══ */

/** Get category name string from either old format "string" or new {name, emoji} */
export function getCategoryName(cat) {
  return typeof cat === 'string' ? cat : cat?.name || 'Otros';
}

/** Get emoji for a category */
export function getCategoryEmoji(cat) {
  return typeof cat === 'string' ? '' : cat?.emoji || '';
}

/** Find a category object by name in the categories array */
export function findCategory(categories, name) {
  return categories.find(
    (c) => (typeof c === 'string' ? c : c?.name) === name
  );
}

/** Get category display: "emoji name" */
export function categoryDisplay(categories, name) {
  const cat = findCategory(categories, name);
  if (!cat) return name;
  const emoji = getCategoryEmoji(cat);
  return emoji ? `${emoji} ${name}` : name;
}
