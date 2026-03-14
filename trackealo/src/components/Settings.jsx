import { useState } from 'react';
import { DEFAULT_CATEGORIES } from '../utils/constants';

function validateImportData(data) {
  const errors = [];

  if (typeof data !== 'object' || data === null) {
    return ['El archivo no contiene un objeto JSON válido'];
  }

  if (data.transactions !== undefined) {
    if (!Array.isArray(data.transactions))
      errors.push('"transactions" debe ser un array');
    else {
      for (let i = 0; i < data.transactions.length; i++) {
        const t = data.transactions[i];
        if (!t.id) errors.push(`Transacción #${i + 1}: falta "id"`);
        if (!t.description)
          errors.push(`Transacción #${i + 1}: falta "description"`);
        if (typeof t.amount !== 'number')
          errors.push(`Transacción #${i + 1}: "amount" debe ser un número`);
        if (!['expense', 'income'].includes(t.type))
          errors.push(
            `Transacción #${i + 1}: "type" debe ser "expense" o "income"`
          );
        if (errors.length > 5) {
          errors.push('...y más errores');
          break;
        }
      }
    }
  }

  if (data.installments !== undefined) {
    if (!Array.isArray(data.installments))
      errors.push('"installments" debe ser un array');
  }

  if (data.budgets !== undefined) {
    if (typeof data.budgets !== 'object' || Array.isArray(data.budgets))
      errors.push('"budgets" debe ser un objeto');
  }

  if (data.goals !== undefined) {
    if (!Array.isArray(data.goals))
      errors.push('"goals" debe ser un array');
  }

  if (data.categories !== undefined) {
    if (!Array.isArray(data.categories))
      errors.push('"categories" debe ser un array');
    else if (!data.categories.every((c) => typeof c === 'string'))
      errors.push('"categories" debe contener solo strings');
  }

  return errors;
}

export default function Settings({
  categories,
  setCategories,
  transactions,
  setTransactions,
  installments,
  setInstallments,
  budgets,
  setBudgets,
  goals,
  setGoals,
  onImportAll,
}) {
  const [nc, setNc] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addCat = () => {
    const name = nc.trim();
    if (name && !categories.includes(name)) {
      setCategories((p) => [...p, name]);
      setNc('');
    }
  };

  const exportData = () => {
    try {
      const d = {
        transactions,
        installments,
        budgets,
        goals,
        categories,
        exportedAt: new Date().toISOString(),
      };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })
      );
      a.download = `expense-tracker-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('✅ Datos exportados correctamente');
    } catch (err) {
      showToast(`❌ Error al exportar: ${err.message}`, 'error');
    }
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        const validationErrors = validateImportData(d);
        if (validationErrors.length > 0) {
          showToast(
            `❌ JSON inválido:\n${validationErrors.join('\n')}`,
            'error'
          );
          return;
        }
        if (onImportAll) {
          await onImportAll(d);
        } else {
          if (d.transactions) setTransactions(d.transactions);
          if (d.installments) setInstallments(d.installments);
          if (d.budgets) setBudgets(d.budgets);
          if (d.goals) setGoals(d.goals);
          if (d.categories) setCategories(d.categories);
        }
        showToast('✅ Datos importados correctamente');
      } catch {
        showToast('❌ El archivo no es un JSON válido', 'error');
      }
    };
    r.onerror = () => {
      showToast('❌ No se pudo leer el archivo', 'error');
    };
    r.readAsText(file);
    e.target.value = '';
  };

  const clearAll = async () => {
    if (window.confirm('¿Borrar todo? No se puede deshacer.')) {
      if (onImportAll) {
        await onImportAll({
          transactions: [],
          installments: [],
          budgets: {},
          goals: [],
          categories: DEFAULT_CATEGORIES,
        });
      } else {
        setTransactions([]);
        setInstallments([]);
        setBudgets({});
        setGoals([]);
        setCategories(DEFAULT_CATEGORIES);
      }
      showToast('🗑️ Datos borrados');
    }
  };

  return (
    <div className="settings-stack">
      {/* Categories */}
      <div className="card">
        <div className="card-title" style={{ fontSize: 14 }}>
          Categorías
        </div>
        <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
          <input
            value={nc}
            onChange={(e) => setNc(e.target.value)}
            placeholder="Nueva categoría"
            className="input"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && addCat()}
          />
          <button onClick={addCat} className="btn btn-primary">
            +
          </button>
        </div>
        <div className="cat-chip-list">
          {categories.map((cat) => (
            <div key={cat} className="cat-chip">
              {cat}
              {!DEFAULT_CATEGORIES.includes(cat) && (
                <button
                  onClick={() =>
                    setCategories((p) => p.filter((c) => c !== cat))
                  }
                  className="btn-icon"
                  style={{ fontSize: 12 }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backup */}
      <div className="card">
        <div className="card-title" style={{ fontSize: 14 }}>
          Backup de datos
        </div>
        <div className="backup-actions">
          <button onClick={exportData} className="btn btn-success">
            📥 Exportar JSON
          </button>
          <label
            className="btn-file-label"
            style={{ background: 'var(--warning)', color: '#000' }}
          >
            📤 Importar JSON
            <input
              type="file"
              accept=".json"
              onChange={importData}
              style={{ display: 'none' }}
            />
          </label>
          <button onClick={clearAll} className="btn btn-danger">
            🗑️ Borrar todo
          </button>
        </div>
        <div className="backup-hint">
          Exportá desde el celu e importá en la compu (o viceversa) para
          sincronizar.
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`import-toast ${
            toast.type === 'error' ? 'import-toast-error' : 'import-toast-success'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
