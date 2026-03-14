import { findCategoryByIdAndUserId } from '@/features/categories/data/categories-repo';
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

  const category = await findCategoryByIdAndUserId(numericId, auth.userId);
  if (!category) return apiError(404, 'Categoria no encontrada');

  return apiSuccess(category);
}
