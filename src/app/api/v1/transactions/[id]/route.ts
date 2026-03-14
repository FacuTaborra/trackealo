import { findTransactionByIdAndUserId } from '@/features/transactions/data/transactions-repo';
import { transactionSchema } from '@/features/transactions/data/get-transactions-schema';
import { apiError, apiSuccess, validateApiKey } from '@/lib/api-auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await validateApiKey(request);
  if (!auth) return apiError(401, 'API key invalida o ausente');

  const { id } = await params;
  const numericId = Number(id);
  if (isNaN(numericId)) return apiError(400, 'ID invalido');

  const row = await findTransactionByIdAndUserId(numericId, auth.userId);
  if (!row) return apiError(404, 'Transaccion no encontrada');

  return apiSuccess(transactionSchema.parse(row));
}
