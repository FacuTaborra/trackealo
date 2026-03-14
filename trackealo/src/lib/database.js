import { supabase } from './supabase';

/* ═══════════════════════════════════════════
   USER SETTINGS
   ═══════════════════════════════════════════ */

export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code === 'PGRST116') {
    const { data: newData } = await supabase
      .from('user_settings')
      .insert({ user_id: userId })
      .select()
      .single();
    return newData;
  }
  if (error) throw error;
  return data;
}

export async function updateUserSettings(userId, updates) {
  const { error } = await supabase
    .from('user_settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

/* ═══════════════════════════════════════════
   TRANSACTIONS (V2: includes new fields)
   ═══════════════════════════════════════════ */

export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map(mapTransaction);
}

export async function addTransaction(userId, tx) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: tx.type,
      description: tx.description,
      amount: tx.amount,
      currency: tx.currency,
      category: tx.category,
      date: tx.date,
      payment_method: tx.paymentMethod || 'efectivo',
      notes: tx.notes || '',
      owner_type: tx.ownerType || 'MÍO',
      receipt_url: tx.receiptUrl || '',
      is_installment: tx.isInstallment || false,
      installment_current: tx.installmentCurrent || 0,
      installment_total: tx.installmentTotal || 0,
      installment_id: tx.installmentId || '',
    })
    .select()
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

export async function deleteTransaction(userId, txId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', txId)
    .eq('user_id', userId);
  if (error) throw error;
}

function mapTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    amount: Number(row.amount),
    currency: row.currency,
    category: row.category,
    date: row.date,
    paymentMethod: row.payment_method || 'efectivo',
    notes: row.notes || '',
    ownerType: row.owner_type || 'MÍO',
    receiptUrl: row.receipt_url || '',
    isInstallment: row.is_installment || false,
    installmentCurrent: row.installment_current || null,
    installmentTotal: row.installment_total || null,
    installmentId: row.installment_id || '',
  };
}

export async function deleteTransactionsByInstallmentId(userId, installmentId) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('installment_id', installmentId)
    .eq('user_id', userId);
  if (error) throw error;
}

/* ═══════════════════════════════════════════
   INSTALLMENTS (V2: includes interest_rate)
   ═══════════════════════════════════════════ */

export async function fetchInstallments(userId) {
  const { data, error } = await supabase
    .from('installments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapInstallment);
}

export async function addInstallment(userId, inst) {
  const { data, error } = await supabase
    .from('installments')
    .insert({
      user_id: userId,
      description: inst.description,
      total_amount: inst.totalAmount,
      total: inst.total,
      monthly: inst.monthly,
      currency: inst.currency,
      category: inst.category,
      start_date: inst.startDate,
      interest_rate: inst.interestRate || 0,
    })
    .select()
    .single();
  if (error) throw error;
  return mapInstallment(data);
}

export async function deleteInstallment(userId, instId) {
  const { error } = await supabase
    .from('installments')
    .delete()
    .eq('id', instId)
    .eq('user_id', userId);
  if (error) throw error;
}

function mapInstallment(row) {
  return {
    id: row.id,
    description: row.description,
    totalAmount: Number(row.total_amount),
    total: row.total,
    monthly: Number(row.monthly),
    currency: row.currency,
    category: row.category,
    startDate: row.start_date,
    interestRate: Number(row.interest_rate) || 0,
  };
}

/* ═══════════════════════════════════════════
   GOALS
   ═══════════════════════════════════════════ */

export async function fetchGoals(userId) {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapGoal);
}

export async function addGoal(userId, goal) {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: goal.name,
      emoji: goal.emoji,
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount || 0,
      currency: goal.currency,
    })
    .select()
    .single();
  if (error) throw error;
  return mapGoal(data);
}

export async function updateGoal(goalId, updates) {
  const mapped = {};
  if (updates.currentAmount !== undefined)
    mapped.current_amount = updates.currentAmount;
  if (updates.targetAmount !== undefined)
    mapped.target_amount = updates.targetAmount;
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.emoji !== undefined) mapped.emoji = updates.emoji;

  const { error } = await supabase
    .from('goals')
    .update(mapped)
    .eq('id', goalId);
  if (error) throw error;
}

export async function deleteGoal(userId, goalId) {
  const { error } = await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
  if (error) throw error;
}

function mapGoal(row) {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    currency: row.currency,
    createdAt: row.created_at,
  };
}

/* ═══════════════════════════════════════════
   BULK IMPORT / EXPORT
   ═══════════════════════════════════════════ */

export async function importAllData(userId, data) {
  await supabase.from('transactions').delete().eq('user_id', userId);
  await supabase.from('installments').delete().eq('user_id', userId);
  await supabase.from('goals').delete().eq('user_id', userId);

  if (data.transactions?.length) {
    const rows = data.transactions.map((t) => ({
      user_id: userId,
      type: t.type,
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      category: t.category,
      date: t.date,
      payment_method: t.paymentMethod || 'efectivo',
      notes: t.notes || '',
      owner_type: t.ownerType || 'MÍO',
    }));
    const { error } = await supabase.from('transactions').insert(rows);
    if (error) throw error;
  }

  if (data.installments?.length) {
    const rows = data.installments.map((i) => ({
      user_id: userId,
      description: i.description,
      total_amount: i.totalAmount,
      total: i.total,
      monthly: i.monthly,
      currency: i.currency,
      category: i.category,
      start_date: i.startDate,
      interest_rate: i.interestRate || 0,
    }));
    const { error } = await supabase.from('installments').insert(rows);
    if (error) throw error;
  }

  if (data.goals?.length) {
    const rows = data.goals.map((g) => ({
      user_id: userId,
      name: g.name,
      emoji: g.emoji,
      target_amount: g.targetAmount,
      current_amount: g.currentAmount,
      currency: g.currency,
    }));
    const { error } = await supabase.from('goals').insert(rows);
    if (error) throw error;
  }

  await updateUserSettings(userId, {
    categories: data.categories,
    budgets: data.budgets,
    usd_rate: data.usdRate,
  });
}
