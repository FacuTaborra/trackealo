import { z } from 'zod';

export const accountSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  type: z.enum(['checking', 'savings', 'credit', 'cash']),
  balance: z.number(),
  currency: z.string(),
  color: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Account = z.infer<typeof accountSchema>;
