'use server';

import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { accountsTable } from '@/db/schema';
import db from '@/db';

import { addAccountSchema } from './add-account-schema';

export const addAccountAction = authActionClient
  .metadata({ actionName: 'addAccount' })
  .inputSchema(addAccountSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db.insert(accountsTable).values({
      user_id: ctx.session.user.id,
      name: parsedInput.name,
      type: parsedInput.type,
      balance: parsedInput.balance,
      currency: parsedInput.currency,
      color: parsedInput.color ?? null
    });
    revalidatePath('/dashboard/accounts');
    revalidatePath('/dashboard/overview');
    return { message: 'Cuenta creada correctamente' };
  });
