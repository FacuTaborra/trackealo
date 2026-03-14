import { z } from 'zod';

export const updateCategorySchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable()
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
