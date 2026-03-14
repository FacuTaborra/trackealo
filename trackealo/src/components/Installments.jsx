import { useState } from 'react';
import { generateId, getMonthKey, parseMonthKey, formatCurrency } from '../utils/helpers';

export default function Installments({
  installments,
  setInstallments,
  categories,
  selectedMonth,
  onAdd,
  onDelete,
}) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    description: '',
    totalAmount: '',
    total: '',
    currency: 'ARS',
    category: categories[0] || 'Otros',
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Ingresá una descripción';
    const ta = Number(form.totalAmount);
    if (!form.totalAmount || ta <= 0)
      e.totalAmount = 'El monto total debe ser mayor a 0';
    const n = Number(form.total);
    if (!form.total || n < 1) e.total = 'Mínimo 1 cuota';
    else if (n > 120) e.total = 'Máximo 120 cuotas';
    if (!form.startDate) e.startDate = 'Seleccioná una fecha';
    return e;
  };

  const add = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const ta = Number(form.totalAmount),
      n = Number(form.total);
    const inst = {
      ...form,
      id: generateId(),
      description: form.description.trim(),
      totalAmount: ta,
      total: n,
      monthly: Math.round(ta / n),
    };
    if (onAdd) {
      await onAdd(inst);
    } else {
      setInstallments((p) => [inst, ...p]);
    }
    setForm((f) => ({ ...f, description: '', totalAmount: '', total: '' }));
    setShow(false);
  };

  const activeNow = installments.filter((inst) => {
    const s = new Date(inst.startDate),
      e = new Date(s);
    e.setMonth(e.getMonth() + inst.total - 1);
    const sel = parseMonthKey(selectedMonth);
    return (
      sel >= new Date(getMonthKey(s) + '-01') &&
      sel <= new Date(getMonthKey(e) + '-01')
    );
  });

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Cuotas</div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShow(!show);
            setErrors({});
          }}
        >
          {show ? 'Cancelar' : '+ Nueva'}
        </button>
      </div>

      {show && (
        <div className="card grid-form" style={{ marginBottom: 14 }}>
          <input
            placeholder="Descripción (ej: Zapatillas Nike)"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className={`input col-full ${errors.description ? 'input-error' : ''}`}
          />
          {errors.description && (
            <div className="form-error">{errors.description}</div>
          )}
          <input
            placeholder="Monto total"
            type="number"
            min="1"
            value={form.totalAmount}
            onChange={(e) =>
              setForm((f) => ({ ...f, totalAmount: e.target.value }))
            }
            className={`input ${errors.totalAmount ? 'input-error' : ''}`}
          />
          <select
            value={form.currency}
            onChange={(e) =>
              setForm((f) => ({ ...f, currency: e.target.value }))
            }
            className="input"
          >
            <option>ARS</option>
            <option>USD</option>
          </select>
          {errors.totalAmount && (
            <div className="form-error">{errors.totalAmount}</div>
          )}
          <input
            placeholder="# cuotas"
            type="number"
            min="1"
            max="120"
            value={form.total}
            onChange={(e) =>
              setForm((f) => ({ ...f, total: e.target.value }))
            }
            className={`input ${errors.total ? 'input-error' : ''}`}
          />
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="input"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {errors.total && <div className="form-error">{errors.total}</div>}
          <div className="col-full">
            <div className="form-hint">Primera cuota</div>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className={`input ${errors.startDate ? 'input-error' : ''}`}
            />
            {errors.startDate && (
              <div className="form-error">{errors.startDate}</div>
            )}
          </div>
          {form.totalAmount && form.total && Number(form.total) > 0 && (
            <div className="info-badge col-full">
              💡 {form.total} cuotas de{' '}
              {formatCurrency(
                Math.round(Number(form.totalAmount) / Number(form.total)),
                form.currency
              )}
            </div>
          )}
          <button onClick={add} className="btn btn-primary-lg col-full">
            Guardar
          </button>
        </div>
      )}

      {activeNow.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="inst-active-label">ACTIVAS ESTE MES</div>
          {activeNow.map((inst) => {
            const s = new Date(inst.startDate),
              sel = parseMonthKey(selectedMonth);
            const c =
              (sel.getFullYear() - s.getFullYear()) * 12 +
              (sel.getMonth() - s.getMonth()) +
              1;
            return (
              <div key={inst.id} className="inst-active-row">
                <span>
                  {inst.description}{' '}
                  <span className="inst-cuota-badge">
                    ({c}/{inst.total})
                  </span>
                </span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  {formatCurrency(inst.monthly, inst.currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {installments.length === 0 && (
          <div className="empty-state">Sin cuotas registradas</div>
        )}
        {installments.map((inst) => {
          const end = new Date(inst.startDate);
          end.setMonth(end.getMonth() + inst.total - 1);
          const now = new Date(),
            s = new Date(inst.startDate);
          const elapsed = Math.max(
            0,
            Math.min(
              inst.total,
              (now.getFullYear() - s.getFullYear()) * 12 +
                (now.getMonth() - s.getMonth()) +
                1
            )
          );
          return (
            <div key={inst.id} className="card" style={{ padding: '11px 12px' }}>
              <div className="inst-header">
                <div>
                  <div className="inst-name">{inst.description}</div>
                  <div className="inst-meta">
                    {inst.category} · hasta{' '}
                    {end.toLocaleDateString('es-AR', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="inst-amount">
                    {formatCurrency(inst.monthly, inst.currency)}/mes
                  </div>
                  <div className="inst-total">
                    Total: {formatCurrency(inst.totalAmount, inst.currency)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (onDelete) {
                      onDelete(inst.id);
                    } else {
                      setInstallments((p) =>
                        p.filter((i) => i.id !== inst.id)
                      );
                    }
                  }}
                  className="btn-icon"
                  style={{ marginLeft: 8 }}
                >
                  ✕
                </button>
              </div>
              <div className="progress-track" style={{ height: 4 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${(elapsed / inst.total) * 100}%`,
                    background: 'var(--accent)',
                    height: 4,
                  }}
                />
              </div>
              <div className="inst-progress-text">
                {elapsed}/{inst.total} pagadas
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
