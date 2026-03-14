'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { categoriesTable } from '@/db/schema';
import db from '@/db';
import { NotFoundError } from '@/lib/errors';

import { deleteCategorySchema } from './delete-category-schema';

export const deleteCategoryAction = authActionClient
  .metadata({ actionName: 'deleteCategory' })
  .inputSchema(deleteCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db
      .delete(categoriesTable)
      .where(
        and(
          eq(categoriesTable.id, parsedInput.id),
          eq(categoriesTable.user_id, ctx.session.user.id)
        )
      )
      .returning({ id: categoriesTable.id });

    if (result.length === 0) {
      throw new NotFoundError('Categoría no encontrada');
    }

    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    return { message: 'Categoría eliminada correctamente' };
  });
