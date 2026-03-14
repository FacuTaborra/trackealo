import { z } from 'zod';

export const addAccountSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  type: z.enum(['checking', 'savings', 'credit', 'cash']),
  balance: z.number().default(0),
  currency: z.string().min(1).default('ARS'),
  color: z.string().optional()
});

export type AddAccountInput = z.infer<typeof addAccountSchema>;
