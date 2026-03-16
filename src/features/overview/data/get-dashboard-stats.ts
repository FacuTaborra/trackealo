'use server';

import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import type { DashboardFilters } from './dashboard-filters';

export async function getDashboardStats(filters: DashboardFilters) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const { currency, fromDate, toDate } = filters;

  const accounts = await db
    .select({ balance: accountsTable.balance })
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.user_id, userId),
        eq(accountsTable.currency, currency)
      )
    );

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const incomeResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(accountsTable.currency, currency),
        eq(transactionsTable.type, 'income'),
        gte(transactionsTable.date, fromDate),
        lte(transactionsTable.date, toDate)
      )
    );

  const expenseResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(accountsTable.currency, currency),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, fromDate),
        lte(transactionsTable.date, toDate)
      )
    );

  const income = Number(incomeResult[0]?.total ?? 0);
  const expense = Number(expenseResult[0]?.total ?? 0);
  const netSavings = income - expense;

  return { totalBalance, income, expense, netSavings };
}

export async function getUserCurrencies(): Promise<string[]> {
  const { session } = await getAuthContext();
  const rows = await db
    .selectDistinct({ currency: accountsTable.currency })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, session.user.id));
  return rows.map((r) => r.currency);
}
