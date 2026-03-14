export function formatCurrency(
  amount: number,
  currency = 'ARS',
  locale = 'es-AR'
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatDate(
  date: Date | string | number | undefined,
  opts: Intl.DateTimeFormatOptions & { locale?: string } = {}
) {
  if (!date) return '';

  try {
    const { locale = 'es-AR', ...formatOpts } = opts;
    return new Intl.DateTimeFormat(locale, {
      month: formatOpts.month ?? 'short',
      day: formatOpts.day ?? 'numeric',
      year: formatOpts.year ?? 'numeric',
      ...formatOpts
    }).format(new Date(date));
  } catch (_err) {
    return '';
  }
}
