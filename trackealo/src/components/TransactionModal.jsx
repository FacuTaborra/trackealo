import { useState, useMemo } from 'react';
import { generateId, calculateInstallmentAmount, formatCurrency, toLocalDateString } from '../utils/helpers';
import { PAYMENT_METHODS, INCOME_TYPES } from '../utils/constants';

export default function TransactionModal({
  categories,
  owners,
  onSave,
  onClose,
  editTransaction,
}) {
  const catNames = useMemo(
    () => categories.map((c) => (typeof c === 'string' ? c : c.name)),
    [categories]
  );
  const catMap = useMemo(() => {
    const m = {};
    categories.forEach((c) => {
      const name = typeof c === 'string' ? c : c.name;
      m[name] = typeof c === 'string' ? '' : c.emoji || '';
    });
    return m;
  }, [categories]);

  const initial = editTransaction || {
    type: 'expense',
    description: '',
    amount: '',
    currency: 'ARS',
    paymentMethod: 'debito',
    category: catNames[0] || 'Otros',
    incomeType: 'sueldo',
    ownerType: owners[0] || 'MÍO',
    notes: '',
    date: toLocalDateString(),
    hasInstallments: false,
    installmentCount: '',
    cftea: '',
  };

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(editTransaction?.receiptUrl || null);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Ingresá una descripción';
    const amt = Number(form.amount);
    if (!form.amount || amt <= 0) e.amount = 'El monto debe ser mayor a 0';
    if (!form.date) e.date = 'Seleccioná una fecha';
    if (form.hasInstallments) {
      const n = Number(form.installmentCount);
      if (!form.installmentCount || n < 2) e.installmentCount = 'Mínimo 2 cuotas';
      if (n > 120) e.installmentCount = 'Máximo 120 cuotas';
    }
    return e;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const isIncome = form.type === 'income';
    const incomeLabel = INCOME_TYPES.find((t) => t.id === form.incomeType)?.label || 'Otros';

    const base = {
      id: form.id || generateId(),
      type: form.type,
      description: form.description.trim(),
      amount: Number(form.amount),
      currency: form.currency,
      paymentMethod: isIncome ? '' : form.paymentMethod,
      category: isIncome ? incomeLabel : form.category,
      ownerType: isIncome ? 'MÍO' : form.ownerType,
      notes: form.notes.trim(),
      date: form.date,
      receiptFile: receiptFile || null,
    };

    if (form.hasInstallments && form.type === 'expense') {
      const numInst = Number(form.installmentCount);
      const cfteaVal = Number(form.cftea) || 0;
      const monthlyAmt = calculateInstallmentAmount(base.amount, numInst, cfteaVal);

      // Create installment record
      const installment = {
        id: generateId(),
        description: base.description,
        totalAmount: base.amount,
        total: numInst,
        monthly: monthlyAmt,
        currency: base.currency,
        category: base.category,
        startDate: base.date,
        interestRate: cfteaVal,
        paymentMethod: base.paymentMethod,
        ownerType: base.ownerType,
        notes: base.notes,
      };
      onSave({ type: 'installment', data: installment });
    } else {
      onSave({ type: 'transaction', data: base });
    }

    onClose();
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, receipt: 'Máximo 5MB' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, receipt: 'Solo imágenes (JPG, PNG, WebP)' }));
      return;
    }
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
    setErrors((prev) => { const { receipt: _r, ...rest } = prev; return rest; });
  };

  const installmentPreview = useMemo(() => {
    if (!form.hasInstallments || !form.amount || !form.installmentCount) return null;
    const n = Number(form.installmentCount);
    const amt = Number(form.amount);
    if (n < 2 || amt <= 0) return null;
    const cfteaVal = Number(form.cftea) || 0;
    const monthly = calculateInstallmentAmount(amt, n, cfteaVal);
    const total = monthly * n;
    return { monthly, total, count: n, interest: total - amt };
  }, [form.hasInstallments, form.amount, form.installmentCount, form.cftea]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {editTransaction ? 'Editar' : 'Nuevo'} movimiento
          </h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => set('type', t)}
                className={`btn btn-toggle ${
                  form.type === t
                    ? t === 'expense' ? 'expense-active' : 'income-active'
                    : ''
                }`}
                style={{ flex: 1 }}
              >
                {t === 'expense' ? '💸 Gasto' : '💵 Ingreso'}
              </button>
            ))}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input
              placeholder="Ej: Supermercado, Netflix..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={`input ${errors.description ? 'input-error' : ''}`}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Amount + Currency */}
          <div className="grid-form">
            <div className="form-group">
              <label className="form-label">Monto</label>
              <input
                placeholder="0.00"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className={`input ${errors.amount ? 'input-error' : ''}`}
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
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

          {/* === INCOME: Tipo de Ingreso === */}
          {form.type === 'income' && (
            <div className="form-group">
              <label className="form-label">Tipo de ingreso</label>
              <select
                value={form.incomeType}
                onChange={(e) => set('incomeType', e.target.value)}
                className="input"
              >
                {INCOME_TYPES.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.emoji} {it.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* === EXPENSE: Payment Method + Category + Owner === */}
          {form.type === 'expense' && (
            <>
              <div className="form-group">
                <label className="form-label">Método de pago</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => set('paymentMethod', e.target.value)}
                  className="input"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.emoji} {pm.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-form">
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    className="input"
                  >
                    {catNames.map((c) => (
                      <option key={c} value={c}>
                        {catMap[c]} {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Propietario</label>
                  <select
                    value={form.ownerType}
                    onChange={(e) => set('ownerType', e.target.value)}
                    className="input"
                  >
                    {owners.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className={`input ${errors.date ? 'input-error' : ''}`}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <textarea
              placeholder="Detalles adicionales..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="input"
              rows={2}
            />
          </div>

          {/* Receipt upload */}
          <div className="form-group">
            <label className="form-label">📎 Recibo (opcional)</label>
            <label className="receipt-picker">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleReceiptChange}
                hidden
              />
              <span className="receipt-picker-btn">
                📷 {receiptFile ? receiptFile.name : receiptPreview ? 'Recibo adjunto' : 'Adjuntar foto'}
              </span>
            </label>
            {receiptPreview && (
              <div className="receipt-preview">
                <img src={receiptPreview} alt="recibo" />
                <button
                  type="button"
                  className="receipt-remove"
                  onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                >✕</button>
              </div>
            )}
            {errors.receipt && <span className="form-error">{errors.receipt}</span>}
          </div>

          {/* Installments section — only for expenses */}
          {form.type === 'expense' && (
            <div className="installment-section">
              <div className="installment-toggle" onClick={() => set('hasInstallments', !form.hasInstallments)}>
                <span className="installment-toggle-label">🔄 ¿Es en cuotas?</span>
                <button
                  className={`theme-switch ${form.hasInstallments ? 'active' : ''}`}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); set('hasInstallments', !form.hasInstallments); }}
                />
              </div>

              {form.hasInstallments && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="grid-form">
                    <div className="form-group">
                      <label className="form-label"># Cuotas</label>
                      <input
                        type="number"
                        min="2"
                        max="120"
                        placeholder="3"
                        value={form.installmentCount}
                        onChange={(e) => set('installmentCount', e.target.value)}
                        className={`input ${errors.installmentCount ? 'input-error' : ''}`}
                      />
                      {errors.installmentCount && <span className="form-error">{errors.installmentCount}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CFTEA %</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0 (sin interés)"
                        value={form.cftea}
                        onChange={(e) => set('cftea', e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {installmentPreview && (
                    <div className="installment-preview">
                      💡 {installmentPreview.count} cuotas de{' '}
                      {formatCurrency(installmentPreview.monthly, form.currency)}
                      {installmentPreview.interest > 0 && (
                        <span style={{ opacity: 0.8 }}>
                          {' '}· Interés total: {formatCurrency(installmentPreview.interest, form.currency)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSave} className="btn btn-primary-lg" style={{ width: '100%', marginTop: 4 }}>
            {editTransaction ? 'Guardar cambios' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
