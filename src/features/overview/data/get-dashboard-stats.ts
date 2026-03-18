'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import type { DashboardFilters } from './dashboard-filters';

export async function getDashboardStats(filters: DashboardFilters) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const { currency, fromDate, toDate, accountId } = filters;

  const accountConditions = [
    eq(accountsTable.user_id, userId),
    eq(accountsTable.currency, currency),
    ...(accountId ? [eq(accountsTable.id, accountId)] : [])
  ];

  const accounts = await db
    .select({ balance: accountsTable.balance })
    .from(accountsTable)
    .where(and(...accountConditions));

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const txConditions = (type: 'income' | 'expense') => [
    eq(transactionsTable.user_id, userId),
    eq(accountsTable.currency, currency),
    eq(transactionsTable.type, type),
    gte(transactionsTable.date, fromDate),
    lte(transactionsTable.date, toDate),
    ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
  ];

  const incomeResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(
      accountsTable,
      eq(transactionsTable.account_id, accountsTable.id)
    )
    .where(and(...txConditions('income')));

  const expenseResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(
      accountsTable,
      eq(transactionsTable.account_id, accountsTable.id)
    )
    .where(and(...txConditions('expense')));

  const income = Number(incomeResult[0]?.total ?? 0);
  const expense = Number(expenseResult[0]?.total ?? 0);
  const netSavings = income - expense;

  const durationMs = toDate.getTime() - fromDate.getTime();
  const prevToDate = new Date(fromDate.getTime() - 86400000);
  const prevFromDate = new Date(prevToDate.getTime() - durationMs);

  const prevTxConditions = (type: 'income' | 'expense') => [
    eq(transactionsTable.user_id, userId),
    eq(accountsTable.currency, currency),
    eq(transactionsTable.type, type),
    gte(transactionsTable.date, prevFromDate),
    lte(transactionsTable.date, prevToDate),
    ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
  ];

  const [prevIncomeResult, prevExpenseResult] = await Promise.all([
    db
      .select({
        total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
      })
      .from(transactionsTable)
      .innerJoin(
        accountsTable,
        eq(transactionsTable.account_id, accountsTable.id)
      )
      .where(and(...prevTxConditions('income'))),
    db
      .select({
        total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
      })
      .from(transactionsTable)
      .innerJoin(
        accountsTable,
        eq(transactionsTable.account_id, accountsTable.id)
      )
      .where(and(...prevTxConditions('expense')))
  ]);

  const prevIncome = Number(prevIncomeResult[0]?.total ?? 0);
  const prevExpense = Number(prevExpenseResult[0]?.total ?? 0);
  const prevNetSavings = prevIncome - prevExpense;

  function pctChange(current: number, previous: number): number | null {
    if (previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    totalBalance,
    income,
    expense,
    netSavings,
    prevIncome,
    prevExpense,
    prevNetSavings,
    incomePctChange: pctChange(income, prevIncome),
    expensePctChange: pctChange(expense, prevExpense),
    netSavingsPctChange: pctChange(netSavings, prevNetSavings)
  };
}

export async function getUserCurrencies(): Promise<string[]> {
  const { session } = await getAuthContext();
  const rows = await db
    .selectDistinct({ currency: accountsTable.currency })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, session.user.id));
  return rows.map((r) => r.currency);
}
