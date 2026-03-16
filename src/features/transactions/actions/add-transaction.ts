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

import { addTransactionSchema } from './add-transaction-schema';

export const addTransactionAction = authActionClient
  .metadata({ actionName: 'addTransaction' })
  .inputSchema(addTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session.user.id;

    await db.transaction(async (tx) => {
      if (parsedInput.type === 'transfer' && parsedInput.to_account_id) {
        const amountIn = parsedInput.to_amount ?? parsedInput.amount;
        await tx.insert(transactionsTable).values([
          {
            user_id: userId,
            account_id: parsedInput.account_id,
            category_id: parsedInput.category_id ?? null,
            amount: parsedInput.amount,
            type: 'transfer',
            description: parsedInput.description,
            date: parsedInput.date,
            notes: parsedInput.notes ?? null,
            to_account_id: parsedInput.to_account_id,
            to_amount: null
          },
          {
            user_id: userId,
            account_id: parsedInput.to_account_id,
            category_id: parsedInput.category_id ?? null,
            amount: amountIn,
            type: 'transfer',
            description: parsedInput.description,
            date: parsedInput.date,
            notes: parsedInput.notes ?? null,
            to_account_id: null,
            to_amount: null
          }
        ]);
      } else {
        const result = await tx
          .insert(transactionsTable)
          .values({
            user_id: userId,
            account_id: parsedInput.account_id,
            category_id: parsedInput.category_id ?? null,
            amount: parsedInput.amount,
            type: parsedInput.type,
            description: parsedInput.description,
            date: parsedInput.date,
            notes: parsedInput.notes ?? null,
            to_account_id: parsedInput.to_account_id ?? null,
            to_amount: parsedInput.to_amount ?? null
          })
          .returning({ id: transactionsTable.id });

        if (result.length === 0) {
          throw new NotFoundError('Error al crear transacción');
        }
      }

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
        const amountIn = parsedInput.to_amount ?? parsedInput.amount;
        await tx
          .update(accountsTable)
          .set({
            balance: sql`${accountsTable.balance} + ${amountIn}`,
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
    return { message: 'Transacción creada correctamente' };
  });
