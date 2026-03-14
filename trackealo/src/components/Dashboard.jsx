import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { COLORS, TIME_PERIODS, MONTHS_ES, PAYMENT_METHODS } from '../utils/constants';
import {
  filterByDateRange, getDateLabel, formatCurrency, parseLocalDate,
} from '../utils/helpers';

/* ─── Shared TimeNav component ─── */
function TimeNav({ period, timeOffset, onPeriodChange, onOffsetChange }) {
  const label = getDateLabel(period, timeOffset);
  const showArrows = period !== 'all';

  return (
    <div className="time-nav">
      <div className="period-filters">
        {TIME_PERIODS.map((tp) => (
          <button
            key={tp.id}
            onClick={() => onPeriodChange(tp.id)}
            className={`period-pill ${period === tp.id ? 'active' : ''}`}
          >
            {tp.label}
          </button>
        ))}
      </div>
      {showArrows && (
        <div className="time-nav-arrows">
          <button className="time-arrow" onClick={() => onOffsetChange(timeOffset - 1)}>◀</button>
          <span className="time-label">{label}</span>
          <button className="time-arrow" onClick={() => onOffsetChange(timeOffset + 1)}>▶</button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({
  transactions,
  categories,
  period,
  timeOffset,
  onPeriodChange,
  onOffsetChange,
  drillCategory,
  onDrillCategory,
}) {
  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      const name = typeof c === 'string' ? c : c.name;
      m[name] = {
        emoji: typeof c === 'string' ? '' : c.emoji || '',
        budget: typeof c === 'string' ? 0 : c.budget || 0,
      };
    });
    return m;
  }, [categories]);

  const filtered = useMemo(
    () => filterByDateRange(transactions, period, timeOffset),
    [transactions, period, timeOffset]
  );

  /* ─── KPIs ─── */
  const kpis = useMemo(() => {
    const incomeItems = filtered.filter((t) => t.type === 'income');
    const expenseItems = filtered.filter((t) => t.type === 'expense');
    const totalIncome = incomeItems.reduce((s, t) => s + t.amount, 0);
    const totalExpense = expenseItems.reduce((s, t) => s + t.amount, 0);
    return {
      count: filtered.length,
      income: totalIncome,
      expense: totalExpense,
      cashFlow: totalIncome - totalExpense,
    };
  }, [filtered]);

  /* ─── Top 5 categories bar ─── */
  const top5Data = useMemo(() => {
    const map = {};
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    const total = Object.values(map).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => ({
        name: `${catMap[cat]?.emoji || ''} ${cat}`,
        rawName: cat,
        amount: amt,
        pct: Math.round((amt / total) * 100),
      }));
  }, [filtered, catMap]);

  /* ─── Donut data ─── */
  const donutData = useMemo(() => {
    const map = {};
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        name: `${catMap[cat]?.emoji || ''} ${cat}`,
        rawName: cat,
        value: amt,
      }));
  }, [filtered, catMap]);

  /* ─── Evolution line (monthly income vs expense) — only for week+ periods ─── */
  const evolutionData = useMemo(() => {
    if (period === 'day') return [];
    const monthMap = {};
    transactions.forEach((t) => {
      const d = parseLocalDate(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
      if (t.type === 'income') monthMap[key].income += t.amount;
      else monthMap[key].expense += t.amount;
    });
    return Object.entries(monthMap)
      .sort()
      .slice(-12)
      .map(([key, val]) => {
        const [, m] = key.split('-').map(Number);
        return { month: MONTHS_ES[m - 1]?.slice(0, 3) || key, Ingresos: val.income, Gastos: val.expense };
      });
  }, [transactions, period]);

  /* ─── Installment projection by category (from filtered transactions) ─── */
  const { projectionData, projectionCategories } = useMemo(() => {
    if (period === 'day' || period === 'week') return { projectionData: [], projectionCategories: [] };

    // Use date-filtered installment transactions so chart reacts to time period
    const instTxs = filtered.filter((t) => t.isInstallment);
    if (instTxs.length === 0) return { projectionData: [], projectionCategories: [] };

    // Build month buckets from the installment tx dates
    const monthMap = {};
    const catSet = new Set();
    instTxs.forEach((tx) => {
      const d = parseLocalDate(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = MONTHS_ES[d.getMonth()]?.slice(0, 3) || '';
      const cat = tx.category || 'Otros';
      catSet.add(cat);
      if (!monthMap[key]) monthMap[key] = { key, label };
      monthMap[key][cat] = (monthMap[key][cat] || 0) + tx.amount;
    });

    const cats = [...catSet];
    const data = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));
    if (data.length === 0) return { projectionData: [], projectionCategories: [] };
    return { projectionData: data, projectionCategories: cats };
  }, [filtered, period]);

  /* ─── Budget vs Real (only if any category has budget > 0) ─── */
  const budgetData = useMemo(() => {
    const hasBudgets = categories.some((c) => typeof c !== 'string' && c.budget > 0);
    if (!hasBudgets) return [];

    const catSpend = {};
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
    });

    return categories
      .map((c) => {
        const name = typeof c === 'string' ? c : c.name;
        const budget = typeof c === 'string' ? 0 : c.budget || 0;
        const spent = catSpend[name] || 0;
        if (budget <= 0) return null;
        return {
          name: `${catMap[name]?.emoji || ''} ${name}`,
          Presupuesto: budget,
          Real: spent,
        };
      })
      .filter(Boolean);
  }, [categories, catMap, filtered]);

  /* ─── Payment method distribution (expenses only) ─── */
  const paymentMethodData = useMemo(() => {
    const map = {};
    filtered.filter((t) => t.type === 'expense').forEach((t) => {
      const method = t.paymentMethod || 'efectivo';
      map[method] = (map[method] || 0) + t.amount;
    });
    const pmLookup = {};
    PAYMENT_METHODS.forEach((pm) => { pmLookup[pm.id] = pm; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([method, amount]) => ({
        name: `${pmLookup[method]?.emoji || ''} ${pmLookup[method]?.label || method}`,
        value: amount,
      }));
  }, [filtered]);

  /* ─── Recent transactions ─── */
  const recentTx = useMemo(() => {
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  }, [filtered]);

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      fontSize: 12,
    },
  };

  /* ─── Handle chart click for drill-down ─── */
  const handleCategoryClick = (catName) => {
    if (onDrillCategory) onDrillCategory(catName);
  };

  /* ─── DRILL-DOWN VIEW ─── */
  if (drillCategory) {
    const drillTxs = filtered.filter((t) => t.category === drillCategory);
    const drillTotal = drillTxs.reduce((s, t) => s + t.amount, 0);
    const drillEmoji = catMap[drillCategory]?.emoji || '';

    return (
      <div className="animate-in">
        <TimeNav period={period} timeOffset={timeOffset} onPeriodChange={onPeriodChange} onOffsetChange={onOffsetChange} />

        <button onClick={() => onDrillCategory(null)} className="btn btn-back" style={{ marginBottom: 10 }}>
          ◀ Volver al Dashboard
        </button>

        <h2 style={{ fontSize: 'var(--fs-xl)', marginBottom: 12 }}>
          {drillEmoji} {drillCategory}
        </h2>

        <div className="kpi-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="kpi-card animate-in">
            <div className="kpi-label"><span>Total Gastado</span><span className="kpi-icon">💸</span></div>
            <div className="kpi-value expense">{formatCurrency(drillTotal, 'ARS')}</div>
          </div>
          <div className="kpi-card animate-in">
            <div className="kpi-label"><span>Transacciones</span><span className="kpi-icon">📊</span></div>
            <div className="kpi-value">{drillTxs.length}</div>
          </div>
        </div>

        {drillTxs.length > 0 ? (
          <div className="card animate-in" style={{ marginTop: 14 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Cuotas</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                {drillTxs.sort((a, b) => new Date(b.date) - new Date(a.date)).map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 500 }}>{tx.description}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {new Date(tx.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600, color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)' }}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td>{tx.paymentMethod || '—'}</td>
                    <td>
                      {tx.isInstallment
                        ? <span className="installment-badge">{tx.installmentCurrent}/{tx.installmentTotal}</span>
                        : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tx.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No hay transacciones en esta categoría para el período seleccionado</p>
          </div>
        )}
      </div>
    );
  }

  /* ─── MAIN DASHBOARD VIEW ─── */
  return (
    <div className="animate-in">
      <TimeNav period={period} timeOffset={timeOffset} onPeriodChange={onPeriodChange} onOffsetChange={onOffsetChange} />

      {/* KPI grid */}
      <div className="kpi-grid">
        <div className="kpi-card animate-in">
          <div className="kpi-label"><span>Transacciones</span><span className="kpi-icon">📊</span></div>
          <div className="kpi-value">{kpis.count}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label"><span>Ingresos</span><span className="kpi-icon">📈</span></div>
          <div className="kpi-value income">{formatCurrency(kpis.income, 'ARS')}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label"><span>Gastos</span><span className="kpi-icon">📉</span></div>
          <div className="kpi-value expense">{formatCurrency(kpis.expense, 'ARS')}</div>
        </div>
        <div className="kpi-card animate-in">
          <div className="kpi-label"><span>Cash Flow</span><span className="kpi-icon">💰</span></div>
          <div className={`kpi-value ${kpis.cashFlow >= 0 ? 'income' : 'expense'}`}>
            {kpis.cashFlow >= 0 ? '+' : '-'}{formatCurrency(Math.abs(kpis.cashFlow), 'ARS')}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="charts-grid">
        {/* Evolution — hide on day */}
        {evolutionData.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">📈 Ingresos vs Gastos</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="Ingresos" stroke="var(--income)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Gastos" stroke="var(--expense)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top 5 categories bar */}
        {top5Data.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">🏆 Top 5 Categorías</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={top5Data} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={100} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="pct" name="%" fill="var(--accent)">
                  {top5Data.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCategoryClick(entry.rawName)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Donut */}
        {donutData.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">🍩 Distribución de Gastos</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  style={{ cursor: 'pointer' }}
                  onClick={(entry) => { if (entry?.rawName) handleCategoryClick(entry.rawName); }}
                >
                  {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Installment projection by category — hide on day/week */}
        {projectionData.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">🔄 Proyección Cuotas</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {projectionCategories.map((cat, i) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    name={`${catMap[cat]?.emoji || ''} ${cat}`}
                    stackId="cuotas"
                    fill={COLORS[i % COLORS.length]}
                    radius={i === projectionCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCategoryClick(cat)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Payment method pie chart */}
        {paymentMethodData.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">💳 Gastos por Método de Pago</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {paymentMethodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget vs Real bar chart — only if budgets exist */}
        {budgetData.length > 0 && (
          <div className="chart-card animate-in">
            <div className="chart-card-title">🎯 Presupuesto vs Real</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={budgetData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Presupuesto" fill="var(--accent)" radius={[4, 4, 0, 0]} opacity={0.5} />
                <Bar dataKey="Real" radius={[4, 4, 0, 0]}>
                  {budgetData.map((entry, i) => (
                    <Cell key={i} fill={entry.Real > entry.Presupuesto ? 'var(--expense)' : 'var(--income)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      {recentTx.length > 0 && (
        <div className="card animate-in">
          <div className="card-title">📋 Últimos Movimientos</div>
          <table className="summary-table">
            <tbody>
              {recentTx.map((tx) => (
                <tr key={tx.id}>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {catMap[tx.category]?.emoji || ''} {tx.description}
                  </td>
                  <td style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(tx.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ fontWeight: 600, textAlign: 'right', color: tx.type === 'income' ? 'var(--income)' : 'var(--expense)', whiteSpace: 'nowrap' }}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>No hay datos para este período</p>
          <p style={{ fontSize: 'var(--fs-xs)' }}>Agregá transacciones con el botón +</p>
        </div>
      )}
    </div>
  );
}
