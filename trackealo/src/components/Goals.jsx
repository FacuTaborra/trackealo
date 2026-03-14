import { useState } from 'react';
import { generateId, formatCurrency } from '../utils/helpers';

export default function Goals({
  goals,
  setGoals,
  currency,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    emoji: '🎯',
    targetAmount: '',
    currency: currency || 'ARS',
  });
  const [savingsInput, setSavingsInput] = useState({});

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const add = async () => {
    if (!form.name.trim() || !form.targetAmount) return;
    const goal = {
      id: generateId(),
      name: form.name.trim(),
      emoji: form.emoji,
      targetAmount: Number(form.targetAmount),
      currentAmount: 0,
      currency: form.currency,
    };
    if (onAdd) {
      await onAdd(goal);
    } else {
      setGoals((p) => [...p, goal]);
    }
    setForm({ name: '', emoji: '🎯', targetAmount: '', currency: currency || 'ARS' });
    setShowForm(false);
  };

  const addSavings = (id, amount) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newAmount = Math.max(0, goal.currentAmount + Number(amount));
    if (onUpdate) {
      onUpdate(id, { currentAmount: newAmount });
    } else {
      setGoals((p) =>
        p.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
      );
    }
    setSavingsInput((p) => ({ ...p, [id]: '' }));
  };

  const remove = (id) => {
    if (onDelete) {
      onDelete(id);
    } else {
      setGoals((p) => p.filter((g) => g.id !== id));
    }
  };

  return (
    <div className="animate-in">
      <div className="section-header">
        <h2 className="section-title">🎯 Objetivos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? '✕ Cerrar' : '+ Nuevo'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card animate-in" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="grid-form">
              <div className="form-group">
                <label className="form-label">Emoji</label>
                <input
                  value={form.emoji}
                  onChange={(e) => set('emoji', e.target.value)}
                  className="input"
                  style={{ textAlign: 'center' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  placeholder="Ej: Vacaciones, Auto..."
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <div className="grid-form">
              <div className="form-group">
                <label className="form-label">Meta</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Monto objetivo"
                  value={form.targetAmount}
                  onChange={(e) => set('targetAmount', e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className="input"
                >
                  <option>ARS</option>
                  <option>USD</option>
                </select>
              </div>
            </div>
            <button onClick={add} className="btn btn-primary-lg" style={{ width: '100%' }}>
              Crear Meta
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <p>No tenés metas todavía</p>
          <p style={{ fontSize: 'var(--fs-xs)' }}>Creá tu primera meta de ahorro</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map((goal) => {
            const pct = goal.targetAmount > 0
              ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              : 0;
            const completed = pct >= 100;

            return (
              <div key={goal.id} className="goal-card animate-in">
                <div className="goal-header">
                  <div>
                    <span className="goal-emoji">{goal.emoji}</span>
                    <div className="goal-name">{goal.name}</div>
                  </div>
                  <button
                    onClick={() => remove(goal.id)}
                    className="btn-icon"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: completed ? 'var(--income)' : 'var(--accent)',
                    }}
                  />
                </div>

                <div className="goal-stats">
                  <span>{formatCurrency(goal.currentAmount, goal.currency)}</span>
                  <span>{Math.round(pct)}%</span>
                  <span>{formatCurrency(goal.targetAmount, goal.currency)}</span>
                </div>

                {!completed && (
                  <div className="goal-savings-input">
                    <input
                      type="number"
                      placeholder="Agregar ahorro..."
                      value={savingsInput[goal.id] || ''}
                      onChange={(e) =>
                        setSavingsInput((p) => ({ ...p, [goal.id]: e.target.value }))
                      }
                      className="input"
                    />
                    <button
                      onClick={() => addSavings(goal.id, savingsInput[goal.id] || 0)}
                      className="btn btn-success"
                    >
                      +
                    </button>
                  </div>
                )}

                {completed && (
                  <div className="info-badge" style={{ marginTop: 8, textAlign: 'center' }}>
                    🎉 ¡Meta completada!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
