'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import {
  accountsTable,
  transactionsTable
} from '@/db/schema';
import db from '@/db';
import { NotFoundError } from '@/lib/errors';

import { deleteTransactionSchema } from './delete-transaction-schema';

export const deleteTransactionAction = authActionClient
  .metadata({ actionName: 'deleteTransaction' })
  .inputSchema(deleteTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session.user.id;

    const existing = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, parsedInput.id),
          eq(transactionsTable.user_id, userId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundError('Transacción no encontrada');
    }

    const tx = existing[0];

    await db.transaction(async (dbTx) => {
      if (tx.type === 'income') {
        await dbTx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} - ${tx.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, tx.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      } else if (tx.type === 'expense') {
        await dbTx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} + ${tx.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, tx.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      } else if (tx.type === 'transfer') {
        const isOutgoing = tx.to_account_id != null;
        await dbTx
          .update(accountsTable)
          .set({
            balance: isOutgoing
              ? sql`${accountsTable.balance} + ${tx.amount}`
              : sql`${accountsTable.balance} - ${tx.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, tx.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      }

      await dbTx
        .delete(transactionsTable)
        .where(
          and(
            eq(transactionsTable.id, parsedInput.id),
            eq(transactionsTable.user_id, userId)
          )
        );
    });

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/overview');
    return { message: 'Transacción eliminada correctamente' };
  });
