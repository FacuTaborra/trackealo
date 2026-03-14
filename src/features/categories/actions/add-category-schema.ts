import { z } from 'zod';

export const addCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  icon: z.string().optional(),
  color: z.string().optional()
});

export type AddCategoryInput = z.infer<typeof addCategorySchema>;
