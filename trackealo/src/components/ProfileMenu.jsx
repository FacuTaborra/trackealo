import { useState } from 'react';
import { useAuth } from '../contexts/useAuth';

export default function ProfileMenu({
  user,
  categories,
  onCategoriesChange,
  owners,
  onOwnersChange,
  usdRate,
  onUsdRateChange,
  onExport,
  onImport,
  onClearAll,
  theme,
  onThemeToggle,
  onClose,
}) {
  const { signOut } = useAuth();
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [newOwner, setNewOwner] = useState('');
  const [editBudgets, setEditBudgets] = useState(false);
  const [tempBudgets, setTempBudgets] = useState({});
  const [confirmClear, setConfirmClear] = useState(false);

  // File import
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        onImport(data);
      } catch {
        alert('Archivo inválido');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const exists = categories.some(
      (c) => (typeof c === 'string' ? c : c.name) === newCatName.trim()
    );
    if (exists) return;
    onCategoriesChange([
      ...categories,
      { name: newCatName.trim(), emoji: newCatEmoji, budget: Number(newCatBudget) || 0 },
    ]);
    setNewCatName('');
    setNewCatEmoji('📦');
    setNewCatBudget('');
    setShowCategoryForm(false);
  };

  const deleteCategory = (name) => {
    onCategoriesChange(
      categories.filter((c) => (typeof c === 'string' ? c : c.name) !== name)
    );
  };

  const saveBudgets = () => {
    const updated = categories.map((c) => {
      const name = typeof c === 'string' ? c : c.name;
      return {
        name,
        emoji: typeof c === 'string' ? '' : c.emoji || '',
        budget: tempBudgets[name] !== undefined ? Number(tempBudgets[name]) : (c.budget || 0),
      };
    });
    onCategoriesChange(updated);
    setEditBudgets(false);
  };

  const addOwner = () => {
    if (!newOwner.trim() || owners.includes(newOwner.trim())) return;
    onOwnersChange([...owners, newOwner.trim()]);
    setNewOwner('');
    setShowOwnerForm(false);
  };

  const deleteOwner = (o) => {
    if (o === 'MÍO') return;
    onOwnersChange(owners.filter((x) => x !== o));
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const displayName = user?.user_metadata?.full_name || user?.email || 'Sin sesión';

  return (
    <>
      <div className="profile-dropdown-overlay" onClick={onClose} />
      <div className="profile-dropdown">
        {/* User info */}
        <div className="profile-dropdown-header">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="profile-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="profile-dropdown-name">{initials}</div>
          )}
          <div className="profile-dropdown-email">{displayName}</div>
        </div>

        {/* Theme */}
        <div className="dropdown-section">
          <div className="theme-toggle">
            <span style={{ fontSize: 14, color: 'var(--text-body)' }}>
              {theme === 'dark' ? '🌙 Modo oscuro' : '☀️ Modo claro'}
            </span>
            <button
              className={`theme-switch ${theme === 'dark' ? 'active' : ''}`}
              onClick={onThemeToggle}
            />
          </div>
        </div>

        {/* USD */}
        <div className="dropdown-section">
          <div className="dropdown-section-title">Cotización USD</div>
          <div className="dropdown-inline-setting">
            <span style={{ fontSize: 13, color: 'var(--text-body)' }}>1 USD =</span>
            <input
              type="number"
              min="0"
              step="10"
              value={usdRate}
              onChange={(e) => onUsdRateChange(Number(e.target.value))}
              className="dropdown-inline-input"
            />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ARS</span>
          </div>
        </div>

        {/* Categories */}
        <div className="dropdown-section">
          <div className="dropdown-section-title">Categorías</div>
          <div style={{ padding: '4px 12px' }}>
            <div className="cat-chip-list">
              {categories.map((c) => {
                const name = typeof c === 'string' ? c : c.name;
                const emoji = typeof c === 'string' ? '' : c.emoji || '';
                return (
                  <div key={name} className="cat-chip">
                    {emoji} {name}
                    <button
                      onClick={() => deleteCategory(name)}
                      className="btn-icon"
                      style={{ fontSize: 11, padding: 2 }}
                    >✕</button>
                  </div>
                );
              })}
            </div>
          </div>

          {showCategoryForm ? (
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <input
                placeholder="Emoji"
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                className="input"
                style={{ width: 50, textAlign: 'center' }}
              />
              <input
                placeholder="Nombre"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="input"
                style={{ flex: 1 }}
              />
              <button onClick={addCategory} className="btn btn-primary">+</button>
              <button onClick={() => setShowCategoryForm(false)} className="btn btn-secondary">✕</button>
            </div>
          ) : (
            <button onClick={() => setShowCategoryForm(true)} className="dropdown-item">
              <span className="dropdown-item-icon">➕</span> Agregar categoría
            </button>
          )}

          {/* Budget editing */}
          {editBudgets ? (
            <div style={{ padding: '6px 12px' }}>
              {categories.map((c) => {
                const name = typeof c === 'string' ? c : c.name;
                const current = c.budget || 0;
                return (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 13 }}>
                    <span style={{ flex: 1, color: 'var(--text-body)' }}>{name}</span>
                    <input
                      type="number"
                      min="0"
                      placeholder={String(current)}
                      value={tempBudgets[name] ?? ''}
                      onChange={(e) => setTempBudgets((t) => ({ ...t, [name]: e.target.value }))}
                      className="dropdown-inline-input"
                      style={{ width: 80 }}
                    />
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={saveBudgets} className="btn btn-primary" style={{ flex: 1 }}>Guardar</button>
                <button onClick={() => setEditBudgets(false)} className="btn btn-secondary">✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditBudgets(true)} className="dropdown-item">
              <span className="dropdown-item-icon">📊</span> Presupuestos
            </button>
          )}
        </div>

        {/* Owners */}
        <div className="dropdown-section">
          <div className="dropdown-section-title">Propietarios</div>
          <div style={{ padding: '4px 12px' }}>
            <div className="cat-chip-list">
              {owners.map((o) => (
                <div key={o} className="cat-chip">
                  {o}
                  {o !== 'MÍO' && (
                    <button
                      onClick={() => deleteOwner(o)}
                      className="btn-icon"
                      style={{ fontSize: 11, padding: 2 }}
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {showOwnerForm ? (
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6 }}>
              <input
                placeholder="Nombre / Apodo"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="input"
                style={{ flex: 1 }}
              />
              <button onClick={addOwner} className="btn btn-primary">+</button>
              <button onClick={() => setShowOwnerForm(false)} className="btn btn-secondary">✕</button>
            </div>
          ) : (
            <button onClick={() => setShowOwnerForm(true)} className="dropdown-item">
              <span className="dropdown-item-icon">👤</span> Agregar propietario
            </button>
          )}
        </div>

        {/* Data */}
        <div className="dropdown-section">
          <div className="dropdown-section-title">Datos</div>
          <button onClick={onExport} className="dropdown-item">
            <span className="dropdown-item-icon">📤</span> Exportar JSON
          </button>
          <label className="dropdown-item" style={{ cursor: 'pointer' }}>
            <span className="dropdown-item-icon">📥</span> Importar JSON
            <input type="file" accept=".json" onChange={handleFileImport} hidden />
          </label>
          {confirmClear ? (
            <div style={{ padding: '6px 12px', display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--expense)' }}>¿Seguro?</span>
              <button onClick={() => { onClearAll(); setConfirmClear(false); }} className="btn btn-danger" style={{ flex: 1 }}>
                Sí, borrar todo
              </button>
              <button onClick={() => setConfirmClear(false)} className="btn btn-secondary">No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="dropdown-item danger">
              <span className="dropdown-item-icon">🗑️</span> Borrar todos los datos
            </button>
          )}
        </div>

        {/* Logout */}
        <div className="dropdown-section">
          <button onClick={signOut} className="dropdown-item danger">
            <span className="dropdown-item-icon">🚪</span> Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
