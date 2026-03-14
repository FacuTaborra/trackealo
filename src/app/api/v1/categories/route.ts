import { addCategorySchema } from '@/features/categories/actions/add-category-schema';
import {
  findCategoriesByUserId,
  insertCategory
} from '@/features/categories/data/categories-repo';
import { apiError, apiSuccess, validateApiKey } from '@/lib/api-auth';

export async function GET(request: Request) {
  const auth = await validateApiKey(request);
  if (!auth) return apiError(401, 'API key invalida o ausente');

  const rows = await findCategoriesByUserId(auth.userId);
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

  const parsed = addCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(400, 'Datos invalidos', parsed.error.flatten().fieldErrors as Record<string, unknown>);
  }

  const category = await insertCategory(auth.userId, parsed.data);
  return apiSuccess(category, 201);
}
