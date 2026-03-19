'use server';

import { and, eq, gte, inArray, lt, lte, sql } from 'drizzle-orm';

import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import { getMonthlyStats } from './get-monthly-stats';
import type { DashboardFilters } from './dashboard-filters';

const MS_PER_DAY = 86_400_000;

async function getNetBalanceBefore(
  userId: string,
  currency: string,
  beforeDate: Date,
  accountId?: number
): Promise<number> {
  const result = await db
    .select({
      net: sql<number>`COALESCE(SUM(CASE
        WHEN ${transactionsTable.type} = 'income' THEN ${transactionsTable.amount}
        WHEN ${transactionsTable.type} = 'expense' THEN -${transactionsTable.amount}
        ELSE 0
      END), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(
      accountsTable,
      eq(transactionsTable.account_id, accountsTable.id)
    )
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(accountsTable.currency, currency),
        lt(transactionsTable.date, beforeDate),
        ...(accountId ? [eq(transactionsTable.account_id, accountId)] : [])
      )
    );
  return Number(result[0]?.net ?? 0);
}

export async function getBalanceTrend(filters: DashboardFilters) {
  const { session } = await getAuthContext();
  const userId = session.user.id;
  const { currency, fromDate, toDate, accountId } = filters;
  const diffDays = Math.round(
    (toDate.getTime() - fromDate.getTime()) / MS_PER_DAY
  );

  const startOfFromDate = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const initialBalance = await getNetBalanceBefore(
    userId,
    currency,
    startOfFromDate,
    accountId
  );

  if (diffDays > 31) {
    const monthlyData = await getMonthlyStats(filters);
    let cumulative = initialBalance;
    return monthlyData.map((d) => {
      cumulative += d.income - d.expense;
      return { month: d.month, balance: cumulative };
    });
  }

  return getDailyTrend(filters, initialBalance);
}

async function getDailyTrend(
  filters: DashboardFilters,
  initialBalance: number
) {
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

  let cumulative = initialBalance;
  return Object.entries(dailyNet).map(([month, net]) => {
    cumulative += net;
    return { month, net, balance: cumulative };
  });
}
