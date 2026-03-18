'use server';

import { and, eq, gte, inArray, lte } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import { getMonthlyStats } from './get-monthly-stats';
import type { DashboardFilters } from './dashboard-filters';

const MS_PER_DAY = 86_400_000;

export async function getBalanceTrend(filters: DashboardFilters) {
  const { fromDate, toDate } = filters;
  const diffDays = Math.round(
    (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY
  );

  if (diffDays > 31) {
    const monthlyData = await getMonthlyStats(filters);
    let cumulative = 0;
    return monthlyData.map((d) => {
      cumulative += d.income - d.expense;
      return { month: d.month, balance: cumulative };
    });
  }

  return getDailyTrend(filters);
}

async function getDailyTrend(filters: DashboardFilters) {
  const { session } = await getAuthContext();
  const userId = session.user.id;
  const { currency, fromDate, toDate, categoryIds, accountId } = filters;

  const conditions = [
    eq(transactionsTable.user_id, userId),
    eq(accountsTable.currency, currency),
    gte(
      transactionsTable.date,
      new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
    ),
    lte(
      transactionsTable.date,
      new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate(),
        23,
        59,
        59
      )
    ),
    ...(categoryIds && categoryIds.length > 0
      ? [inArray(transactionsTable.category_id, categoryIds)]
      : []),
    ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
  ];

  const rows = await db
    .select({
      date: transactionsTable.date,
      amount: transactionsTable.amount,
      type: transactionsTable.type
    })
    .from(transactionsTable)
    .innerJoin(
      accountsTable,
      eq(transactionsTable.account_id, accountsTable.id)
    )
    .where(and(...conditions));

  const startDay = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const endDay = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate()
  );
  const diffDays =
    Math.round((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1;

  const dailyNet: Record<string, number> = {};
  for (let i = 0; i < diffDays; i++) {
    const d = new Date(startDay.getTime() + i * MS_PER_DAY);
    const key = d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short'
    });
    dailyNet[key] = 0;
  }

  for (const row of rows) {
    const d = new Date(row.date);
    const key = d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short'
    });
    if (key in dailyNet) {
      const sign = row.type === 'income' ? 1 : row.type === 'expense' ? -1 : 0;
      dailyNet[key] += sign * row.amount;
    }
  }

  let cumulative = 0;
  return Object.entries(dailyNet).map(([month, net]) => {
    cumulative += net;
    return { month, net, balance: cumulative };
  });
}
