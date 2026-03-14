import { and, eq } from 'drizzle-orm';

import { categoriesTable } from '@/db/schema';
import db from '@/db';
import type { AddCategoryInput } from '../actions/add-category-schema';

export async function findCategoriesByUserId(userId: string) {
  return db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.user_id, userId));
}

export async function findCategoryByIdAndUserId(id: number, userId: string) {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(and(eq(categoriesTable.id, id), eq(categoriesTable.user_id, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertCategory(userId: string, data: AddCategoryInput) {
  const rows = await db
    .insert(categoriesTable)
    .values({
      user_id: userId,
      name: data.name,
      icon: data.icon?.trim() || null,
      color: data.color?.trim() || null
    })
    .returning();
  return rows[0];
}
