'use server';

import { randomBytes, createHash } from 'crypto';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { apiKeysTable } from '@/db/schema';
import db from '@/db';

import { createApiKeySchema } from './create-api-key-schema';

function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const raw = randomBytes(20).toString('hex');
  const fullKey = `trkl_${raw}`;
  const prefix = fullKey.slice(0, 13); // "trkl_" + 8 chars
  const hash = createHash('sha256').update(fullKey).digest('hex');
  return { fullKey, prefix, hash };
}

export const createApiKeyAction = authActionClient
  .metadata({ actionName: 'createApiKey' })
  .inputSchema(createApiKeySchema)
  .action(async ({ parsedInput, ctx }) => {
    const { fullKey, prefix, hash } = generateApiKey();

    await db.insert(apiKeysTable).values({
      user_id: ctx.session.user.id,
      name: parsedInput.name,
      key_prefix: prefix,
      key_hash: hash
    });

    revalidatePath('/dashboard/api-keys');

    // La clave completa se retorna una sola vez
    return { key: fullKey };
  });
