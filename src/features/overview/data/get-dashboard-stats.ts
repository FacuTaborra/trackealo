'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';

import {
  accountsTable,
  transactionsTable
} from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

export async function getDashboardStats() {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const accounts = await db
    .select({ balance: accountsTable.balance })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, userId));

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  const incomeResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, 'income'),
        gte(transactionsTable.date, startOfMonth),
        lte(transactionsTable.date, endOfMonth)
      )
    );

  const expenseResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, startOfMonth),
        lte(transactionsTable.date, endOfMonth)
      )
    );

  const income = Number(incomeResult[0]?.total ?? 0);
  const expense = Number(expenseResult[0]?.total ?? 0);
  const netSavings = income - expense;

  return {
    totalBalance,
    income,
    expense,
    netSavings
  };
}
