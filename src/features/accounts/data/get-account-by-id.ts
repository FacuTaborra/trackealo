'use server';

import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { accountsTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';
import { NotFoundError } from '@/lib/errors';

import { accountSchema, getAccountByIdSchema } from './get-account-by-id-schema';

export async function getAccountById(input: z.infer<typeof getAccountByIdSchema>) {
  const parsed = getAccountByIdSchema.parse(input);
  const { session } = await getAuthContext();

  const rows = await db
    .select()
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.id, parsed.id),
        eq(accountsTable.user_id, session.user.id)
      )
    )
    .limit(1);

  if (rows.length === 0) {
    throw new NotFoundError('Cuenta no encontrada');
  }

  return accountSchema.parse(rows[0]);
}
