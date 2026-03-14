import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;
