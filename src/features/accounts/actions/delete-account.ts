'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { accountsTable, transactionsTable } from '@/db/schema';
import db from '@/db';
import { NotFoundError, PreConditionError } from '@/lib/errors';

import { deleteAccountSchema } from './delete-account-schema';

export const deleteAccountAction = authActionClient
  .metadata({ actionName: 'deleteAccount' })
  .inputSchema(deleteAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const transactions = await db
      .select({ id: transactionsTable.id })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.account_id, parsedInput.id),
          eq(transactionsTable.user_id, ctx.session.user.id)
        )
      )
      .limit(1);

    if (transactions.length > 0) {
      throw new PreConditionError(
        'No se puede eliminar la cuenta porque tiene transacciones asociadas'
      );
    }

    const result = await db
      .delete(accountsTable)
      .where(
        and(
          eq(accountsTable.id, parsedInput.id),
          eq(accountsTable.user_id, ctx.session.user.id)
        )
      )
      .returning({ id: accountsTable.id });

    if (result.length === 0) {
      throw new NotFoundError('Cuenta no encontrada');
    }

    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/overview');
    return { message: 'Cuenta eliminada correctamente' };
  });
