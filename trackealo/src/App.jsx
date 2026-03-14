import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './contexts/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import * as db from './lib/database';
import { uploadReceipt } from './lib/storage';
import { DEFAULT_CATEGORIES } from './utils/constants';
import { loadState, saveState, generateId } from './utils/helpers';

import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import DataTable from './components/DataTable';
import Goals from './components/Goals';
import TransactionModal from './components/TransactionModal';
import ProfileMenu from './components/ProfileMenu';

const isConfigured = isSupabaseConfigured();

export default function App() {
  const { user, loading: authLoading } = useAuth();

  /* ─── Theme ─── */
  const [theme, setTheme] = useState(() => loadState('et_theme', 'dark'));
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveState('et_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  /* ─── Core State ─── */
  const [transactions, setTransactions] = useState(() => loadState('et_tx', []));
  const [installments, setInstallments] = useState(() => loadState('et_inst', []));
  const [goals, setGoals] = useState(() => loadState('et_goals', []));
  const [categories, setCategories] = useState(() => loadState('et_cats', DEFAULT_CATEGORIES));
  const [usdRate, setUsdRate] = useState(() => loadState('et_usd', 1200));
  const [owners, setOwners] = useState(() => loadState('et_owners', ['MÍO', 'EXT']));

  /* ─── UI State ─── */
  const [tab, setTab] = useState('dashboard');
  const [period, setPeriod] = useState('month');
  const [timeOffset, setTimeOffset] = useState(0);
  const [drillCategory, setDrillCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!isConfigured);
  const [toast, setToast] = useState(null);

  const handlePeriodChange = useCallback((newPeriod) => {
    setPeriod(newPeriod);
    setTimeOffset(0);
    setDrillCategory(null);
  }, []);

  /* ─── Toast helper ─── */
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ─── Persist to localStorage ─── */
  useEffect(() => { saveState('et_tx', transactions); }, [transactions]);
  useEffect(() => { saveState('et_inst', installments); }, [installments]);
  useEffect(() => { saveState('et_goals', goals); }, [goals]);
  useEffect(() => { saveState('et_cats', categories); }, [categories]);
  useEffect(() => { saveState('et_usd', usdRate); }, [usdRate]);
  useEffect(() => { saveState('et_owners', owners); }, [owners]);

  /* ─── Load from Supabase ─── */
  useEffect(() => {
    if (authLoading || !user || !isConfigured) return;

    Promise.all([
      db.fetchUserSettings(user.id),
      db.fetchTransactions(user.id),
      db.fetchInstallments(user.id),
      db.fetchGoals(user.id),
    ])
      .then(([settings, txs, insts, gls]) => {
        if (settings?.categories?.length) setCategories(settings.categories);
        if (settings?.usd_rate) setUsdRate(settings.usd_rate);
        if (settings?.owners?.length) setOwners(settings.owners);
        setTransactions(txs);
        setInstallments(insts);
        setGoals(gls);
        setDataLoaded(true);
      })
      .catch((err) => {
        console.error('Error loading data:', err);
        setDataLoaded(true);
      });
  }, [user, authLoading]);

  /* ─── Sync settings to Supabase ─── */
  const syncSettings = useCallback(
    (updates) => {
      if (user && isConfigured) {
        db.updateUserSettings(user.id, updates).catch(console.error);
      }
    },
    [user]
  );

  /* ─── Generate installment transactions ─── */
  const generateInstallmentTxs = useCallback(
    (inst) => {
      const txs = [];
      for (let i = 0; i < inst.total; i++) {
        const d = new Date(inst.startDate);
        d.setMonth(d.getMonth() + i);
        txs.push({
          id: generateId(),
          type: 'expense',
          description: inst.description,
          amount: inst.monthly,
          currency: inst.currency,
          category: inst.category,
          date: d.toISOString().slice(0, 10),
          paymentMethod: inst.paymentMethod || 'credito',
          notes: inst.notes || '',
          ownerType: inst.ownerType || 'MÍO',
          isInstallment: true,
          installmentCurrent: i + 1,
          installmentTotal: inst.total,
          installmentId: inst.id,
        });
      }
      return txs;
    },
    []
  );

  /* ─── Handle save from TransactionModal ─── */
  const handleModalSave = useCallback(
    async (result) => {
      if (result.type === 'transaction') {
        const tx = result.data;
        const receiptFile = tx.receiptFile;
        delete tx.receiptFile;

        if (user && isConfigured) {
          try {
            // Upload receipt if present
            if (receiptFile) {
              try {
                tx.receiptUrl = await uploadReceipt(user.id, receiptFile);
              } catch (e) {
                console.error('Receipt upload failed:', e);
              }
            }
            const saved = await db.addTransaction(user.id, tx);
            setTransactions((p) => [saved, ...p]);
          } catch (e) {
            console.error(e);
            setTransactions((p) => [tx, ...p]);
          }
        } else {
          setTransactions((p) => [tx, ...p]);
        }
        showToast('✅ Movimiento guardado');
      } else if (result.type === 'installment') {
        const inst = result.data;
        if (user && isConfigured) {
          try {
            const saved = await db.addInstallment(user.id, inst);
            setInstallments((p) => [saved, ...p]);
            // Generate transaction entries — use original inst (has notes/paymentMethod/ownerType) + saved.id
            const txs = generateInstallmentTxs({ ...inst, id: saved.id });
            for (const tx of txs) {
              try {
                const savedTx = await db.addTransaction(user.id, tx);
                setTransactions((p) => [savedTx, ...p]);
              } catch (e) {
                console.error(e);
                setTransactions((p) => [tx, ...p]);
              }
            }
          } catch (e) {
            console.error(e);
            setInstallments((p) => [inst, ...p]);
            const txs = generateInstallmentTxs(inst);
            setTransactions((p) => [...txs, ...p]);
          }
        } else {
          setInstallments((p) => [inst, ...p]);
          const txs = generateInstallmentTxs(inst);
          setTransactions((p) => [...txs, ...p]);
        }
        showToast(`✅ ${inst.total} cuotas creadas`);
      }
    },
    [user, generateInstallmentTxs, showToast]
  );

  /* ─── Delete transaction ─── */
  const handleDeleteTx = useCallback(
    async (id) => {
      setTransactions((p) => p.filter((t) => t.id !== id));
      if (user && isConfigured) {
        db.deleteTransaction(user.id, id).catch(console.error);
      }
    },
    [user]
  );

  const handleDeleteInstallmentGroup = useCallback(
    async (installmentId) => {
      setTransactions((p) => p.filter((t) => t.installmentId !== installmentId));
      if (user && isConfigured) {
        db.deleteTransactionsByInstallmentId(user.id, installmentId).catch(console.error);
      }
      showToast('🗑 Cuotas eliminadas');
    },
    [user, showToast]
  );

  /* ─── Categories ─── */
  const handleCategoriesChange = useCallback(
    (newCats) => {
      setCategories(newCats);
      syncSettings({ categories: newCats });
    },
    [syncSettings]
  );

  /* ─── Owners ─── */
  const handleOwnersChange = useCallback(
    (newOwners) => {
      setOwners(newOwners);
      syncSettings({ owners: newOwners });
    },
    [syncSettings]
  );

  /* ─── USD ─── */
  const handleUsdChange = useCallback(
    (rate) => {
      setUsdRate(rate);
      syncSettings({ usd_rate: rate });
    },
    [syncSettings]
  );

  /* ─── Goals handlers ─── */
  const handleAddGoal = useCallback(
    async (goal) => {
      if (user && isConfigured) {
        try {
          const saved = await db.addGoal(user.id, goal);
          setGoals((p) => [...p, saved]);
        } catch (e) {
          console.error(e);
          setGoals((p) => [...p, goal]);
        }
      } else {
        setGoals((p) => [...p, goal]);
      }
      showToast('✅ Meta creada');
    },
    [user, showToast]
  );

  const handleUpdateGoal = useCallback(
    async (id, updates) => {
      setGoals((p) =>
        p.map((g) => (g.id === id ? { ...g, ...updates } : g))
      );
      if (user && isConfigured) {
        db.updateGoal(id, updates).catch(console.error);
      }
    },
    [user]
  );

  const handleDeleteGoal = useCallback(
    async (id) => {
      setGoals((p) => p.filter((g) => g.id !== id));
      if (user && isConfigured) {
        db.deleteGoal(user.id, id).catch(console.error);
      }
    },
    [user]
  );

  /* ─── Export ─── */
  const handleExport = useCallback(() => {
    const data = { transactions, installments, goals, categories, usdRate, owners };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📤 Backup exportado');
  }, [transactions, installments, goals, categories, usdRate, owners, showToast]);

  /* ─── Import ─── */
  const handleImport = useCallback(
    async (data) => {
      if (data.transactions) setTransactions(data.transactions);
      if (data.installments) setInstallments(data.installments);
      if (data.goals) setGoals(data.goals);
      if (data.categories) setCategories(data.categories);
      if (data.usdRate) setUsdRate(data.usdRate);
      if (data.owners) setOwners(data.owners);

      if (user && isConfigured) {
        try {
          await db.importAllData(user.id, data);
        } catch (e) {
          console.error(e);
        }
      }
      showToast('📥 Datos importados');
    },
    [user, showToast]
  );

  /* ─── Clear All ─── */
  const handleClearAll = useCallback(async () => {
    setTransactions([]);
    setInstallments([]);
    setGoals([]);
    setCategories(DEFAULT_CATEGORIES);
    setUsdRate(1200);
    setOwners(['MÍO', 'EXT']);

    if (user && isConfigured) {
      try {
        await db.importAllData(user.id, {
          transactions: [],
          installments: [],
          goals: [],
          categories: DEFAULT_CATEGORIES,
          usdRate: 1200,
        });
      } catch (e) {
        console.error(e);
      }
    }
    showToast('🗑️ Datos borrados');
  }, [user, showToast]);

  /* ─── Auth gate ─── */
  if (isConfigured && authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        Cargando...
      </div>
    );
  }

  if (isConfigured && !user) {
    return <AuthPage />;
  }

  if (!dataLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        Cargando datos...
      </div>
    );
  }

  /* ─── Render ─── */
  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div style={{ width: 36 }} />
          <span className="header-brand animated-brand">TRACKEALO</span>
          <div className="header-right">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="profile-btn"
            >
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="profile-avatar" referrerPolicy="no-referrer" />
              ) : (
                user?.email?.slice(0, 2)?.toUpperCase() || '👤'
              )}
            </button>
          </div>
        </div>

        {/* Nav Tabs */}
        <div className="nav-tabs">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'database', icon: '📋', label: 'Base de Datos' },
            { id: 'goals', icon: '🎯', label: 'Objetivos' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`nav-tab ${tab === t.id ? 'active' : ''}`}
            >
              <span className="nav-tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Profile dropdown */}
        {showProfile && (
          <ProfileMenu
            user={user}
            categories={categories}
            onCategoriesChange={handleCategoriesChange}
            owners={owners}
            onOwnersChange={handleOwnersChange}
            usdRate={usdRate}
            onUsdRateChange={handleUsdChange}
            onExport={handleExport}
            onImport={handleImport}
            onClearAll={handleClearAll}
            theme={theme}
            onThemeToggle={toggleTheme}
            onClose={() => setShowProfile(false)}
          />
        )}
      </header>

      {/* Main content */}
      <main className="main-content">
        {tab === 'dashboard' && (
          <Dashboard
            transactions={transactions}
            installments={installments}
            categories={categories}
            period={period}
            timeOffset={timeOffset}
            onPeriodChange={handlePeriodChange}
            onOffsetChange={setTimeOffset}
            drillCategory={drillCategory}
            onDrillCategory={setDrillCategory}
          />
        )}

        {tab === 'database' && (
          <DataTable
            transactions={transactions}
            categories={categories}
            period={period}
            timeOffset={timeOffset}
            onPeriodChange={handlePeriodChange}
            onOffsetChange={setTimeOffset}
            onDelete={handleDeleteTx}
            onDeleteInstallmentGroup={handleDeleteInstallmentGroup}
          />
        )}

        {tab === 'goals' && (
          <Goals
            goals={goals}
            setGoals={setGoals}
            currency="ARS"
            onAdd={handleAddGoal}
            onUpdate={handleUpdateGoal}
            onDelete={handleDeleteGoal}
          />
        )}
      </main>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)} title="Nuevo movimiento">
        +
      </button>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          categories={categories}
          owners={owners}
          onSave={handleModalSave}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
