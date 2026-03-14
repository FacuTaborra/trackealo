import { z } from 'zod';

import { addTransactionSchema } from '@/features/transactions/actions/add-transaction-schema';
import {
  findTransactionsByUserId,
  insertTransaction
} from '@/features/transactions/data/transactions-repo';
import {
  transactionSchema,
  getTransactionsSchema
} from '@/features/transactions/data/get-transactions-schema';
import { apiError, apiSuccess, validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth) return apiError(401, 'API key invalida o ausente');

  const { searchParams } = new URL(request.url);

  const rawParams = {
    accountId: searchParams.get('accountId')
      ? Number(searchParams.get('accountId'))
      : undefined,
    categoryId: searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId'))
      : undefined,
    type: searchParams.get('type') ?? undefined,
    fromDate: searchParams.get('fromDate') ?? undefined,
    toDate: searchParams.get('toDate') ?? undefined,
    search: searchParams.get('search') ?? undefined
  };

  const parsed = getTransactionsSchema.omit({ ids: true }).safeParse(rawParams);
  if (!parsed.success) {
    return apiError(400, 'Parametros de filtro invalidos', parsed.error.flatten().fieldErrors as Record<string, unknown>);
  }

  const rows = await findTransactionsByUserId(auth.userId, parsed.data);
  return apiSuccess(z.array(transactionSchema).parse(rows));
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

  const parsed = addTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'Datos invalidos', parsed.error.flatten().fieldErrors as Record<string, unknown>);
  }

  const transaction = await insertTransaction(auth.userId, parsed.data);
  return apiSuccess(transaction, 201);
}
