'use server';

import { revalidatePath } from 'next/cache';

import { authActionClient } from '@/lib/actions/safe-action';
import { categoriesTable } from '@/db/schema';
import db from '@/db';

import { addCategorySchema } from './add-category-schema';

export const addCategoryAction = authActionClient
  .metadata({ actionName: 'addCategory' })
  .inputSchema(addCategorySchema)
  .action(async ({ parsedInput, ctx }) => {
    await db.insert(categoriesTable).values({
      user_id: ctx.session.user.id,
      name: parsedInput.name,
      icon: parsedInput.icon?.trim() || null,
      color: parsedInput.color?.trim() || null
    });
    revalidatePath('/dashboard/categories');
    revalidatePath('/dashboard/overview');
    revalidatePath('/dashboard/transactions');
    return { message: 'Categoría creada correctamente' };
  });
