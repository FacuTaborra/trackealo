import { and, eq } from 'drizzle-orm';

import { accountsTable } from '@/db/schema';
import db from '@/db';
import type { AddAccountInput } from '../actions/add-account-schema';

export async function findAccountsByUserId(userId: string) {
  return db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.user_id, userId));
}

export async function findAccountByIdAndUserId(id: number, userId: string) {
  const rows = await db
    .select()
    .from(accountsTable)
    .where(and(eq(accountsTable.id, id), eq(accountsTable.user_id, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertAccount(userId: string, data: AddAccountInput) {
  const rows = await db
    .insert(accountsTable)
    .values({
      user_id: userId,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'ARS',
      color: data.color ?? null
    })
    .returning();
  return rows[0];
}
