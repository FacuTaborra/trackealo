/* ═══ Chart palette ═══ */
export const COLORS = [
  '#6366f1',
  '#22d3ee',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#a855f7',
  '#f97316',
  '#84cc16',
  '#ec4899',
  '#14b8a6',
];

/* ═══ Default categories [{name, emoji, budget}] ═══ */
export const DEFAULT_CATEGORIES = [
  { name: 'Comida', emoji: '🍔', budget: 0 },
  { name: 'Transporte', emoji: '🚗', budget: 0 },
  { name: 'Entretenimiento', emoji: '🎬', budget: 0 },
  { name: 'Salud', emoji: '💊', budget: 0 },
  { name: 'Educación', emoji: '📚', budget: 0 },
  { name: 'Ropa', emoji: '👕', budget: 0 },
  { name: 'Gimnasio', emoji: '🏋️', budget: 0 },
  { name: 'Servicios', emoji: '📱', budget: 0 },
  { name: 'Alquiler', emoji: '🏠', budget: 0 },
  { name: 'Suscripciones', emoji: '🔄', budget: 0 },
  { name: 'Otros', emoji: '📦', budget: 0 },
];

/* ═══ Months in Spanish ═══ */
export const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* ═══ Tabs (3 only) ═══ */
export const VALID_TABS = ['dashboard', 'database', 'goals'];

/* ═══ Payment methods (fixed) ═══ */
export const PAYMENT_METHODS = [
  { id: 'debito', label: 'Débito', emoji: '💳' },
  { id: 'credito', label: 'Crédito', emoji: '💳' },
  { id: 'mercadopago', label: 'Mercado Pago', emoji: '📲' },
  { id: 'efectivo', label: 'Efectivo', emoji: '💵' },
  { id: 'transferencia', label: 'Transferencia', emoji: '🏦' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
];

/* ═══ Income types (fixed) ═══ */
export const INCOME_TYPES = [
  { id: 'sueldo', label: 'Sueldo', emoji: '💼' },
  { id: 'alquiler', label: 'Alquiler', emoji: '🏠' },
  { id: 'apuestas', label: 'Apuestas', emoji: '🎰' },
  { id: 'devolucion', label: 'Devolución', emoji: '🔄' },
  { id: 'freelance', label: 'Freelance', emoji: '💻' },
  { id: 'regalo', label: 'Regalo', emoji: '🎁' },
  { id: 'otros', label: 'Otros', emoji: '📦' },
];

/* ═══ Time period filters ═══ */
export const TIME_PERIODS = [
  { id: 'day', label: 'Día' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'year', label: 'Año' },
  { id: 'all', label: 'Histórico' },
];
