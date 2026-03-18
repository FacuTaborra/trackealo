import { and, eq, gte, inArray, like, lte, sql } from 'drizzle-orm';

import { accountsTable, categoriesTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import type { AddTransactionInput } from '../actions/add-transaction-schema';
import type { GetTransactionsInput } from './get-transactions-schema';

export async function findTransactionsByUserId(
  userId: string,
  params: Omit<GetTransactionsInput, 'ids'> = {}
) {
  const conditions = [eq(transactionsTable.user_id, userId)];

  if (params.accountId) {
    conditions.push(eq(transactionsTable.account_id, params.accountId));
  }
  if (params.categoryId) {
    conditions.push(eq(transactionsTable.category_id, params.categoryId));
  }
  if (params.categoryIds && params.categoryIds.length > 0) {
    conditions.push(inArray(transactionsTable.category_id, params.categoryIds));
  }
  if (params.currency) {
    conditions.push(eq(accountsTable.currency, params.currency));
  }
  if (params.type) {
    conditions.push(eq(transactionsTable.type, params.type));
  }
  if (params.fromDate) {
    conditions.push(gte(transactionsTable.date, params.fromDate));
  }
  if (params.toDate) {
    conditions.push(lte(transactionsTable.date, params.toDate));
  }
  if (params.search) {
    conditions.push(like(transactionsTable.description, `%${params.search}%`));
  }

  return db
    .select({
      id: transactionsTable.id,
      user_id: transactionsTable.user_id,
      account_id: transactionsTable.account_id,
      category_id: transactionsTable.category_id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      notes: transactionsTable.notes,
      to_account_id: transactionsTable.to_account_id,
      to_amount: transactionsTable.to_amount,
      created_at: transactionsTable.created_at,
      updated_at: transactionsTable.updated_at,
      account: {
        id: accountsTable.id,
        name: accountsTable.name,
        type: accountsTable.type,
        currency: accountsTable.currency
      },
      category: {
        id: categoriesTable.id,
        name: categoriesTable.name
      }
    })
    .from(transactionsTable)
    .leftJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.category_id, categoriesTable.id)
    )
    .where(and(...conditions))
    .orderBy(sql`${transactionsTable.date} DESC`);
}

export async function findTransactionByIdAndUserId(id: number, userId: string) {
  const rows = await db
    .select({
      id: transactionsTable.id,
      user_id: transactionsTable.user_id,
      account_id: transactionsTable.account_id,
      category_id: transactionsTable.category_id,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      description: transactionsTable.description,
      date: transactionsTable.date,
      notes: transactionsTable.notes,
      to_account_id: transactionsTable.to_account_id,
      to_amount: transactionsTable.to_amount,
      created_at: transactionsTable.created_at,
      updated_at: transactionsTable.updated_at,
      account: {
        id: accountsTable.id,
        name: accountsTable.name,
        type: accountsTable.type,
        currency: accountsTable.currency
      },
      category: {
        id: categoriesTable.id,
        name: categoriesTable.name
      }
    })
    .from(transactionsTable)
    .leftJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .leftJoin(
      categoriesTable,
      eq(transactionsTable.category_id, categoriesTable.id)
    )
    .where(
      and(eq(transactionsTable.id, id), eq(transactionsTable.user_id, userId))
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function insertTransaction(
  userId: string,
  data: AddTransactionInput
) {
  return db.transaction(async (tx) => {
    const [transaction] = await tx
      .insert(transactionsTable)
      .values({
        user_id: userId,
        account_id: data.account_id,
        category_id: data.category_id ?? null,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date,
        notes: data.notes ?? null,
        to_account_id: data.to_account_id ?? null,
        to_amount: data.to_amount ?? null
      })
      .returning();

    if (data.type === 'income') {
      await tx
        .update(accountsTable)
        .set({
          balance: sql`${accountsTable.balance} + ${data.amount}`,
          updated_at: new Date()
        })
        .where(
          and(
            eq(accountsTable.id, data.account_id),
            eq(accountsTable.user_id, userId)
          )
        );
    } else if (data.type === 'expense') {
      await tx
        .update(accountsTable)
        .set({
          balance: sql`${accountsTable.balance} - ${data.amount}`,
          updated_at: new Date()
        })
        .where(
          and(
            eq(accountsTable.id, data.account_id),
            eq(accountsTable.user_id, userId)
          )
        );
    } else if (data.type === 'transfer' && data.to_account_id) {
      await tx
        .update(accountsTable)
        .set({
          balance: sql`${accountsTable.balance} - ${data.amount}`,
          updated_at: new Date()
        })
        .where(
          and(
            eq(accountsTable.id, data.account_id),
            eq(accountsTable.user_id, userId)
          )
        );
      const amountIn = data.to_amount ?? data.amount;
      await tx
        .update(accountsTable)
        .set({
          balance: sql`${accountsTable.balance} + ${amountIn}`,
          updated_at: new Date()
        })
        .where(
          and(
            eq(accountsTable.id, data.to_account_id),
            eq(accountsTable.user_id, userId)
          )
        );
    }

    return transaction;
  });
}
