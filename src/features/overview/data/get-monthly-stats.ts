'use server';

import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import type { DashboardFilters } from './dashboard-filters';

export async function getMonthlyStats(filters: DashboardFilters) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const { currency, fromDate, toDate, categoryIds, accountId } = filters;

  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const end = new Date(
    toDate.getFullYear(),
    toDate.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const monthsCount =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth() +
    1;

  const result: { month: string; income: number; expense: number }[] = [];

  for (let i = 0; i < monthsCount; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const baseConditions = [
      eq(transactionsTable.user_id, userId),
      eq(accountsTable.currency, currency),
      gte(transactionsTable.date, monthStart),
      lte(transactionsTable.date, monthEnd),
      ...(categoryIds && categoryIds.length > 0
        ? [inArray(transactionsTable.category_id, categoryIds)]
        : []),
      ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
    ];

    const [incomeRow, expenseRow] = await Promise.all([
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
        })
        .from(transactionsTable)
        .innerJoin(
          accountsTable,
          eq(transactionsTable.account_id, accountsTable.id)
        )
        .where(and(...baseConditions, eq(transactionsTable.type, 'income'))),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
        })
        .from(transactionsTable)
        .innerJoin(
          accountsTable,
          eq(transactionsTable.account_id, accountsTable.id)
        )
        .where(and(...baseConditions, eq(transactionsTable.type, 'expense')))
    ]);

    result.push({
      month: monthStart.toLocaleDateString('es-AR', {
        month: 'short',
        year: '2-digit'
      }),
      income: Number(incomeRow[0]?.total ?? 0),
      expense: Number(expenseRow[0]?.total ?? 0)
    });
  }

  return result;
}
