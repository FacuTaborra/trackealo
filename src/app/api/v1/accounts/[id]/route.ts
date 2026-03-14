import { findAccountByIdAndUserId } from '@/features/accounts/data/accounts-repo';
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

  const account = await findAccountByIdAndUserId(numericId, auth.userId);
  if (!account) return apiError(404, 'Cuenta no encontrada');

  return apiSuccess(account);
}
