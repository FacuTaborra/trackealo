import { z } from 'zod';

export const updateAccountSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'credit', 'cash']),
  balance: z.number(),
  currency: z.string().min(1),
  color: z.string().optional().nullable()
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
