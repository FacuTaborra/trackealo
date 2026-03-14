'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { accountsTable } from '@/db/schema';
import db from '@/db';
import { NotFoundError } from '@/lib/errors';

import { updateAccountSchema } from './update-account-schema';

export const updateAccountAction = authActionClient
  .metadata({ actionName: 'updateAccount' })
  .inputSchema(updateAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db
      .update(accountsTable)
      .set({
        name: parsedInput.name,
        type: parsedInput.type,
        balance: parsedInput.balance,
        currency: parsedInput.currency,
        color: parsedInput.color ?? null,
        updated_at: new Date()
      })
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
    revalidatePath(`/dashboard/accounts/${parsedInput.id}`);
    revalidatePath('/dashboard/overview');
    return { message: 'Cuenta actualizada correctamente' };
  });
