'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { apiKeysTable } from '@/db/schema';
import db from '@/db';
import { getAuthContext } from '@/lib/context';

import { apiKeySchema } from './get-api-keys-schema';

export async function getApiKeys() {
  const { session } = await getAuthContext();

  const rows = await db
    .select({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      key_prefix: apiKeysTable.key_prefix,
      created_at: apiKeysTable.created_at,
      last_used_at: apiKeysTable.last_used_at
    })
    .from(apiKeysTable)
    .where(eq(apiKeysTable.user_id, session.user.id))
    .orderBy(apiKeysTable.created_at);

  return z.array(apiKeySchema).parse(rows);
}
