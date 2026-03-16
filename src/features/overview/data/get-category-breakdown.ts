'use server';

import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm';

import { accountsTable, categoriesTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import type { DashboardFilters } from './dashboard-filters';

export async function getCategoryBreakdown(filters: DashboardFilters, limit = 10) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const { currency, fromDate, toDate, categoryIds } = filters;

  const categoryFilter =
    categoryIds && categoryIds.length > 0
      ? inArray(transactionsTable.category_id, categoryIds)
      : undefined;

  const rows = await db
    .select({
      categoryName: categoriesTable.name,
      categoryColor: categoriesTable.color,
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(
      categoriesTable,
      eq(transactionsTable.category_id, categoriesTable.id)
    )
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(accountsTable.currency, currency),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, fromDate),
        lte(transactionsTable.date, toDate),
        categoryFilter
      )
    )
    .groupBy(categoriesTable.name, categoriesTable.color)
    .orderBy(sql`SUM(${transactionsTable.amount}) DESC`)
    .limit(limit);

  return rows.map((r) => ({
    name: r.categoryName,
    value: Number(r.total),
    color: r.categoryColor ?? null
  }));
}
