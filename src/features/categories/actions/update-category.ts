'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { categoriesTable } from '@/db/schema';
import db from '@/db';
import { NotFoundError } from '@/lib/errors';

import { updateCategorySchema } from './update-category-schema';

export const updateCategoryAction = authActionClient
  .metadata({ actionName: 'updateCategory' })
  .inputSchema(updateCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    const result = await db
      .update(categoriesTable)
      .set({
        name: parsedInput.name,
        icon: parsedInput.icon?.trim() || null,
        color: parsedInput.color?.trim() || null
      })
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
    return { message: 'Categoría actualizada correctamente' };
  });
