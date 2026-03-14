import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { apiKeysTable } from '@/db/schema';
import db from '@/db';

function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(
  request: Request
): Promise<{ userId: string } | null> {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return null;

  const hash = hashApiKey(apiKey);
  const [row] = await db
    .select()
    .from(apiKeysTable)
    .where(eq(apiKeysTable.key_hash, hash))
    .limit(1);

  if (!row) return null;

  // Actualizar last_used_at sin bloquear la respuesta
  void db
    .update(apiKeysTable)
    .set({ last_used_at: new Date() })
    .where(eq(apiKeysTable.id, row.id));

  return { userId: row.user_id };
}

export function apiError(
  status: number,
  message: string,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
