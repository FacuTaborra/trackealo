import { z } from 'zod';

import { addAccountSchema } from '@/features/accounts/actions/add-account-schema';
import {
  findAccountsByUserId,
  insertAccount
} from '@/features/accounts/data/accounts-repo';
import { apiError, apiSuccess, validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth) return apiError(401, 'API key invalida o ausente');

  const rows = await findAccountsByUserId(auth.userId);
  return apiSuccess(rows);
}

export async function POST(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth) return apiError(401, 'API key invalida o ausente');

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'El cuerpo de la solicitud no es JSON valido');
  }

  const parsed = addAccountSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'Datos invalidos', parsed.error.flatten().fieldErrors as Record<string, unknown>);
  }

  const account = await insertAccount(auth.userId, parsed.data);
  return apiSuccess(account, 201);
}
