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

import { updateTransactionSchema } from './update-transaction-schema';

export const updateTransactionAction = authActionClient
  .metadata({ actionName: 'updateTransaction' })
  .inputSchema(updateTransactionSchema)
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

    const oldTx = existing[0];

    await db.transaction(async (tx) => {
      const oldAmount = oldTx.amount;
      const oldType = oldTx.type;
      const oldAccountId = oldTx.account_id;
      const oldToAccountId = oldTx.to_account_id;

      const revertBalance = async (
        accountId: number,
        amount: number,
        isAdd: boolean
      ) => {
        await tx
          .update(accountsTable)
          .set({
            balance: isAdd
              ? sql`${accountsTable.balance} + ${amount}`
              : sql`${accountsTable.balance} - ${amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, accountId),
              eq(accountsTable.user_id, userId)
            )
          );
      };

      if (oldType === 'income') {
        await revertBalance(oldAccountId, oldAmount, false);
      } else if (oldType === 'expense') {
        await revertBalance(oldAccountId, oldAmount, true);
      } else if (oldType === 'transfer' && oldToAccountId) {
        await revertBalance(oldAccountId, oldAmount, true);
        await revertBalance(oldToAccountId, oldAmount, false);
      }

      await tx
        .update(transactionsTable)
        .set({
          account_id: parsedInput.account_id,
          category_id: parsedInput.category_id ?? null,
          amount: parsedInput.amount,
          type: parsedInput.type,
          description: parsedInput.description,
          date: parsedInput.date,
          notes: parsedInput.notes ?? null,
          to_account_id: parsedInput.to_account_id ?? null,
          updated_at: new Date()
        })
        .where(
          and(
            eq(transactionsTable.id, parsedInput.id),
            eq(transactionsTable.user_id, userId)
          )
        );

      if (parsedInput.type === 'income') {
        await tx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} + ${parsedInput.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, parsedInput.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      } else if (parsedInput.type === 'expense') {
        await tx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} - ${parsedInput.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, parsedInput.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      } else if (parsedInput.type === 'transfer' && parsedInput.to_account_id) {
        await tx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} - ${parsedInput.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, parsedInput.account_id),
              eq(accountsTable.user_id, userId)
            )
          );
        await tx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} + ${parsedInput.amount}`,
            updated_at: new Date()
          })
          .where(
            and(
              eq(accountsTable.id, parsedInput.to_account_id),
              eq(accountsTable.user_id, userId)
            )
          );
      }
    });

    revalidatePath('/dashboard/transactions');
    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/overview');
    return { message: 'Transacción actualizada correctamente' };
  });
