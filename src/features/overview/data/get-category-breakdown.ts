'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';

import { categoriesTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

export async function getCategoryBreakdown(limit = 5) {
  const { session } = await getAuthContext();
  const userId = session.user.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const rows = await db
    .select({
      categoryName: categoriesTable.name,
      total: sql<number>`COALESCE(SUM(${transactionsTable.amount}), 0)::real`
    })
    .from(transactionsTable)
    .innerJoin(
      categoriesTable,
      eq(transactionsTable.category_id, categoriesTable.id)
    )
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, startOfMonth),
        lte(transactionsTable.date, endOfMonth)
      )
    )
    .groupBy(categoriesTable.name)
    .orderBy(sql`SUM(${transactionsTable.amount}) DESC`)
    .limit(limit);

  return rows.map((r) => ({
    name: r.categoryName,
    value: Number(r.total)
  }));
}
