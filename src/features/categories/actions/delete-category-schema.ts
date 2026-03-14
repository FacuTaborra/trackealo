import { z } from 'zod';

export const deleteCategorySchema = z.object({
  id: z.number()
});

export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
