import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TIME_PERIODS, PAYMENT_METHODS } from '../utils/constants';
import { filterByDateRange, getDateLabel, formatCurrency } from '../utils/helpers';
import { getReceiptUrl } from '../lib/storage';

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

export default function DataTable({
  transactions,
  categories,
  period,
  timeOffset,
  onPeriodChange,
  onOffsetChange,
  onDelete,
  onDeleteInstallmentGroup,
}) {
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterOwner, setFilterOwner] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null); // { url, description }

  // When lightbox opens, blur the entire page behind it
  useEffect(() => {
    if (receiptModal) {
      document.body.classList.add('lightbox-open');
    } else {
      document.body.classList.remove('lightbox-open');
    }
    return () => document.body.classList.remove('lightbox-open');
  }, [receiptModal]);

  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      const name = typeof c === 'string' ? c : c.name;
      m[name] = typeof c === 'string' ? '' : c.emoji || '';
    });
    return m;
  }, [categories]);

  const allRows = useMemo(
    () => filterByDateRange(transactions, period, timeOffset),
    [transactions, period, timeOffset]
  );

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }
    if (filterMethod !== 'all')
      rows = rows.filter((r) => r.paymentMethod === filterMethod);
    if (filterOwner !== 'all')
      rows = rows.filter((r) => (r.ownerType || 'MÍO') === filterOwner);
    if (filterType === 'income')
      rows = rows.filter((r) => r.type === 'income');
    else if (filterType === 'expense')
      rows = rows.filter((r) => r.type === 'expense');
    else if (filterType === 'installment')
      rows = rows.filter((r) => r.isInstallment);
    return rows;
  }, [allRows, search, filterMethod, filterOwner, filterType]);

  const totals = useMemo(() => {
    const inc = filteredRows
      .filter((r) => r.type === 'income')
      .reduce((s, r) => s + r.amount, 0);
    const exp = filteredRows
      .filter((r) => r.type === 'expense')
      .reduce((s, r) => s + r.amount, 0);
    return { count: filteredRows.length, income: inc, expense: exp };
  }, [filteredRows]);

  const uniqueOwners = useMemo(() => {
    const set = new Set(transactions.map((t) => t.ownerType || 'MÍO'));
    return [...set];
  }, [transactions]);

  /* ─── Delete handler (with installment confirmation) ─── */
  const handleDeleteClick = (row) => {
    if (row.isInstallment && row.installmentId) {
      setDeleteConfirm(row);
    } else {
      onDelete(row.id);
    }
  };

  const handleDeleteSingle = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteAll = () => {
    if (deleteConfirm && deleteConfirm.installmentId) {
      onDeleteInstallmentGroup(deleteConfirm.installmentId);
      setDeleteConfirm(null);
    }
  };

  const handleViewReceipt = async (row) => {
    try {
      const url = await getReceiptUrl(row.receiptUrl);
      if (url) setReceiptModal({ url, description: row.description });
    } catch (e) {
      console.error('Failed to load receipt:', e);
    }
  };

  return (
    <div className="animate-in">
      <TimeNav period={period} timeOffset={timeOffset} onPeriodChange={onPeriodChange} onOffsetChange={onOffsetChange} />

      {/* Filters */}
      <div className="table-filters">
        <input
          className="input search-input"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="input filter-select"
        >
          <option value="all">Todos los métodos</option>
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm.id} value={pm.id}>
              {pm.emoji} {pm.label}
            </option>
          ))}
        </select>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="input filter-select"
        >
          <option value="all">Todos</option>
          {uniqueOwners.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input filter-select"
        >
          <option value="all">Todo tipo</option>
          <option value="income">Ingresos</option>
          <option value="expense">Gastos</option>
          <option value="installment">Cuotas</option>
        </select>
      </div>

      {/* Table */}
      {filteredRows.length > 0 ? (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Categoría</th>
                <th>Cuotas</th>
                <th>Notas</th>
                <th>Propietario</th>
                <th>Imagen</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((row) => {
                  const pm = PAYMENT_METHODS.find((p) => p.id === row.paymentMethod);
                  return (
                    <tr key={row.id}>
                      <td style={{ fontWeight: 500 }}>{row.description}</td>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {new Date(row.date).toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td
                        style={{
                          fontWeight: 600,
                          color: row.type === 'income' ? 'var(--income)' : 'var(--expense)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.type === 'income' ? '+' : '-'}
                        {formatCurrency(row.amount, row.currency)}
                      </td>
                      <td>
                        {pm ? (
                          <span className="method-badge">{pm.emoji} {pm.label}</span>
                        ) : (
                          row.paymentMethod || '—'
                        )}
                      </td>
                      <td>
                        <span className="category-badge">
                          {catMap[row.category] || ''} {row.category}
                        </span>
                      </td>
                      <td>
                        {row.isInstallment ? (
                          <span className="installment-badge">
                            {row.installmentCurrent}/{row.installmentTotal}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{
                        color: 'var(--text-muted)',
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {row.notes || '—'}
                      </td>
                      <td>
                        <span className={`owner-badge ${row.ownerType === 'MÍO' ? 'mine' : 'ext'}`}>
                          {row.ownerType || 'MÍO'}
                        </span>
                      </td>
                      <td>
                        {row.receiptUrl ? (
                          <button
                            onClick={() => handleViewReceipt(row)}
                            className="receipt-view-btn"
                            title="Ver recibo"
                          >
                            📷 Ver
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteClick(row)}
                          className="btn-icon danger"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No hay datos para este período</p>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="table-summary-kpis">
        <div className="summary-kpi">
          <div className="summary-kpi-label">Registros</div>
          <div className="summary-kpi-value">{totals.count}</div>
        </div>
        <div className="summary-kpi">
          <div className="summary-kpi-label">Ingresos</div>
          <div className="summary-kpi-value income">+{formatCurrency(totals.income, 'ARS')}</div>
        </div>
        <div className="summary-kpi">
          <div className="summary-kpi-label">Gastos</div>
          <div className="summary-kpi-value expense">-{formatCurrency(totals.expense, 'ARS')}</div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Installments */}
      {deleteConfirm && (
        <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>🗑 Eliminar cuota</h3>
            <p>
              <strong>{deleteConfirm.description}</strong> — Cuota {deleteConfirm.installmentCurrent}/{deleteConfirm.installmentTotal}
              <br /><br />
              ¿Querés eliminar solo esta cuota o todas las cuotas de esta compra?
            </p>
            <div className="confirm-actions">
              <button className="btn" onClick={handleDeleteSingle}>
                Eliminar solo esta cuota
              </button>
              <button className="btn danger" onClick={handleDeleteAll}>
                Eliminar todas las cuotas ({deleteConfirm.installmentTotal})
              </button>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Lightbox — rendered via portal at body level */}
      {receiptModal && createPortal(
        <div className="receipt-lightbox" onClick={() => setReceiptModal(null)}>
          <div className="receipt-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="receipt-lightbox-close" onClick={() => setReceiptModal(null)}>✕</button>
            <h3 style={{ margin: '0 0 12px', color: 'var(--text-primary)', paddingRight: 40 }}>
              🧾 {receiptModal.description}
            </h3>
            <img src={receiptModal.url} alt="Recibo" className="receipt-lightbox-img" />
            <div className="receipt-lightbox-actions">
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const res = await fetch(receiptModal.url);
                    const blob = await res.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `recibo_${receiptModal.description.replace(/\s+/g, '_')}.jpg`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  } catch (e) {
                    console.error(e);
                    window.open(receiptModal.url, '_blank');
                  }
                }}
              >
                ⬇️ Descargar
              </button>
              {typeof navigator.share === 'function' && (
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      const res = await fetch(receiptModal.url);
                      const blob = await res.blob();
                      const file = new File([blob], `recibo_${receiptModal.description.replace(/\s+/g, '_')}.jpg`, { type: blob.type });
                      await navigator.share({ title: receiptModal.description, files: [file] });
                    } catch (e) {
                      if (e.name !== 'AbortError') console.error(e);
                    }
                  }}
                >
                  📤 Compartir
                </button>
              )}
              <a
                href={receiptModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                🔗 Abrir
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
