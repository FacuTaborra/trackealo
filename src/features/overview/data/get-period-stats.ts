'use server';

import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import { getMonthlyStats } from './get-monthly-stats';
import type { DashboardFilters } from './dashboard-filters';

const MS_PER_DAY = 86_400_000;

export type PeriodStat = { month: string; income: number; expense: number };

export async function getPeriodStats(
  filters: DashboardFilters
): Promise<PeriodStat[]> {
  const { fromDate, toDate } = filters;
  const diffDays = Math.round(
    (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY
  );

  if (diffDays > 31) {
    return getMonthlyStats(filters);
  }

  return getDailyStats(filters);
}

async function getDailyStats(filters: DashboardFilters): Promise<PeriodStat[]> {
  const { session } = await getAuthContext();
  const userId = session.user.id;
  const { currency, fromDate, toDate, categoryIds, accountId } = filters;

  const startDay = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const endDay = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate(),
    23,
    59,
    59
  );
  const diffDays =
    Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1;

  const baseConditions = [
    eq(transactionsTable.user_id, userId),
    eq(accountsTable.currency, currency),
    gte(transactionsTable.date, startDay),
    lte(transactionsTable.date, endDay),
    ...(categoryIds && categoryIds.length > 0
      ? [inArray(transactionsTable.category_id, categoryIds)]
      : []),
    ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
  ];

  const [incomeRows, expenseRows] = await Promise.all([
    db
      .select({
        date: transactionsTable.date,
        total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
      })
      .from(transactionsTable)
      .innerJoin(
        accountsTable,
        eq(transactionsTable.account_id, accountsTable.id)
      )
      .where(and(...baseConditions, eq(transactionsTable.type, 'income')))
      .groupBy(transactionsTable.date),
    db
      .select({
        date: transactionsTable.date,
        total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
      })
      .from(transactionsTable)
      .innerJoin(
        accountsTable,
        eq(transactionsTable.account_id, accountsTable.id)
      )
      .where(and(...baseConditions, eq(transactionsTable.type, 'expense')))
      .groupBy(transactionsTable.date)
  ]);

  const toKey = (d: Date) =>
    new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });

  const incomeMap = new Map<string, number>();
  for (const r of incomeRows) incomeMap.set(toKey(r.date), Number(r.total));

  const expenseMap = new Map<string, number>();
  for (const r of expenseRows) expenseMap.set(toKey(r.date), Number(r.total));

  return Array.from({ length: diffDays }, (_, i) => {
    const d = new Date(startDay.getTime() + i * MS_PER_DAY);
    const key = toKey(d);
    return {
      month: key,
      income: incomeMap.get(key) ?? 0,
      expense: expenseMap.get(key) ?? 0
    };
  });
}
