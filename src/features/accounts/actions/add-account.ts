'use server';

import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';

import { addAccountSchema } from './add-account-schema';

export const addAccountAction = authActionClient
  .metadata({ actionName: 'addAccount' })
  .inputSchema(addAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db.transaction(async (tx) => {
      const [newAccount] = await tx
        .insert(accountsTable)
        .values({
          user_id: ctx.session.user.id,
          name: parsedInput.name,
          type: parsedInput.type,
          balance: parsedInput.balance,
          currency: parsedInput.currency,
          color: parsedInput.color ?? null
        })
        .returning({ id: accountsTable.id });

      if (parsedInput.balance > 0) {
        await tx.insert(transactionsTable).values({
          user_id: ctx.session.user.id,
          account_id: newAccount.id,
          amount: parsedInput.balance,
          type: 'income',
          description: 'Saldo inicial',
          date: new Date(),
          category_id: null,
          notes: null,
          to_account_id: null,
          to_amount: null
        });
      }
    });

    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/overview');
    return { message: 'Cuenta creada correctamente' };
  });
