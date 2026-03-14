import { useState } from 'react';
import { generateId } from '../utils/helpers';
import { formatCurrency } from '../utils/helpers';

export default function Transactions({
  setTransactions,
  categories,
  monthTransactions,
  onAdd,
  onDelete,
}) {
  const [form, setForm] = useState({
    type: 'expense',
    description: '',
    amount: '',
    currency: 'ARS',
    category: categories[0] || 'Otros',
    date: new Date().toISOString().slice(0, 10),
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Ingresá una descripción';
    const amt = Number(form.amount);
    if (!form.amount || amt <= 0) e.amount = 'El monto debe ser mayor a 0';
    if (!form.date) {
      e.date = 'Seleccioná una fecha';
    } else {
      const selected = new Date(form.date + 'T23:59:59');
      if (selected > new Date()) e.date = 'La fecha no puede ser futura';
    }
    return e;
  };

  const add = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const tx = {
      ...form,
      id: generateId(),
      amount: Number(form.amount),
      description: form.description.trim(),
    };
    if (onAdd) {
      await onAdd(tx);
    } else {
      setTransactions((p) => [tx, ...p]);
    }
    setForm((f) => ({ ...f, description: '', amount: '' }));
    setShow(false);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-title">Movimientos</div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShow(!show);
            setErrors({});
          }}
        >
          {show ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {show && (
        <div className="card grid-form" style={{ marginBottom: 14 }}>
          <div className="col-full" style={{ display: 'flex', gap: 6 }}>
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`btn btn-toggle ${
                  form.type === t
                    ? t === 'expense'
                      ? 'expense-active'
                      : 'income-active'
                    : ''
                }`}
              >
                {t === 'expense' ? '💸 Gasto' : '💵 Ingreso'}
              </button>
            ))}
          </div>
          <input
            placeholder="Descripción"
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
            placeholder="Monto"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
            className={`input ${errors.amount ? 'input-error' : ''}`}
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
          {errors.amount && (
            <div className="form-error">{errors.amount}</div>
          )}
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
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((f) => ({ ...f, date: e.target.value }))
            }
            className={`input ${errors.date ? 'input-error' : ''}`}
          />
          {errors.date && <div className="form-error">{errors.date}</div>}
          <button onClick={add} className="btn btn-primary-lg col-full">
            Guardar
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {monthTransactions.length === 0 && (
          <div className="empty-state">Sin movimientos este mes</div>
        )}
        {[...monthTransactions]
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((t) => (
            <div key={t.id} className="tx-item">
              <div
                className={`tx-icon ${t.type === 'expense' ? 'tx-icon-expense' : 'tx-icon-income'}`}
              >
                {t.type === 'expense' ? '💸' : '💵'}
              </div>
              <div className="tx-info">
                <div className="tx-desc">{t.description}</div>
                <div className="tx-meta">
                  {t.category} ·{' '}
                  {new Date(t.date).toLocaleDateString('es-AR')}
                </div>
              </div>
              <div className="tx-amount">
                <div
                  className="tx-amount-value"
                  style={{
                    color:
                      t.type === 'expense'
                        ? 'var(--danger)'
                        : 'var(--success)',
                  }}
                >
                  {t.type === 'expense' ? '-' : '+'}
                  {formatCurrency(t.amount, t.currency)}
                </div>
                <div className="tx-amount-currency">{t.currency}</div>
              </div>
              {!t.isInstallment && (
                <button
                  onClick={() => {
                    if (onDelete) {
                      onDelete(t.id);
                    } else {
                      setTransactions((p) => p.filter((x) => x.id !== t.id));
                    }
                  }}
                  className="btn-icon"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
