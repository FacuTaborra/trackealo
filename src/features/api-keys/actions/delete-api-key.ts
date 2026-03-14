'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { apiKeysTable } from '@/db/schema';
import db from '@/db';
import { NotFoundError } from '@/lib/errors';

import { deleteApiKeySchema } from './delete-api-key-schema';

export const deleteApiKeyAction = authActionClient
  .metadata({ actionName: 'deleteApiKey' })
  .inputSchema(deleteApiKeySchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db
      .delete(apiKeysTable)
      .where(
        and(
          eq(apiKeysTable.id, parsedInput.id),
          eq(apiKeysTable.user_id, ctx.session.user.id)
        )
      )
      .returning({ id: apiKeysTable.id });

    if (result.length === 0) {
      throw new NotFoundError('API key no encontrada');
    }

    revalidatePath('/dashboard/api-keys');
    return { message: 'API key revocada correctamente' };
  });
