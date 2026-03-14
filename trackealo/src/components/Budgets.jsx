import { useState } from 'react';
import { formatCurrency } from '../utils/helpers';

export default function Budgets({
  budgets,
  setBudgets,
  categories,
  byCategory,
}) {
  const [ec, setEc] = useState(null);
  const [ev, setEv] = useState('');
  const [error, setError] = useState('');

  const save = (cat) => {
    if (!ev) {
      setBudgets((p) => {
        const n = { ...p };
        delete n[cat];
        return n;
      });
    } else {
      const val = Number(ev);
      if (val <= 0) {
        setError('El límite debe ser mayor a 0');
        return;
      }
      setBudgets((p) => ({ ...p, [cat]: val }));
    }
    setEc(null);
    setEv('');
    setError('');
  };

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 14 }}>
        Presupuesto mensual
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map((cat) => {
          const spent = byCategory.find((b) => b.name === cat)?.value || 0,
            budget = budgets[cat];
          const pct = budget ? Math.min((spent / budget) * 100, 100) : 0,
            color =
              pct > 90
                ? 'var(--danger)'
                : pct > 70
                  ? 'var(--warning)'
                  : 'var(--success)';
          return (
            <div key={cat} className="card" style={{ padding: '10px 12px' }}>
              <div
                className="budget-row"
                style={{ marginBottom: budget ? 5 : 0 }}
              >
                <span className="budget-name">{cat}</span>
                <div className="budget-actions">
                  {ec === cat ? (
                    <>
                      <input
                        autoFocus
                        type="number"
                        min="1"
                        value={ev}
                        onChange={(e) => {
                          setEv(e.target.value);
                          setError('');
                        }}
                        placeholder="Límite ARS"
                        className={`input input-inline ${error ? 'input-error' : ''}`}
                      />
                      <button
                        onClick={() => save(cat)}
                        className="btn btn-ghost"
                        style={{
                          background: 'var(--accent)',
                          color: '#fff',
                        }}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setEc(null);
                          setError('');
                        }}
                        className="btn btn-ghost"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      {budget ? (
                        <span
                          style={{
                            color,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {formatCurrency(spent, 'ARS')} /{' '}
                          {formatCurrency(budget, 'ARS')}
                        </span>
                      ) : (
                        <span className="budget-no-limit">Sin límite</span>
                      )}
                      <button
                        onClick={() => {
                          setEc(cat);
                          setEv(budget || '');
                          setError('');
                        }}
                        className="btn btn-ghost"
                      >
                        {budget ? 'Editar' : '+ Límite'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {ec === cat && error && (
                <div className="form-error" style={{ marginTop: 4 }}>
                  {error}
                </div>
              )}
              {budget > 0 && (
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
