'use server';

import { z } from 'zod';

import { getAuthContext } from '@/lib/context';

import { categorySchema } from './get-categories-schema';
import { findCategoriesByUserId } from './categories-repo';

export async function getCategories() {
  const { session } = await getAuthContext();
  const rows = await findCategoriesByUserId(session.user.id);
  return z.array(categorySchema).parse(rows);
}
