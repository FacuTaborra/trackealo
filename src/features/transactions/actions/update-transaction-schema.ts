import { z } from 'zod';

export const updateTransactionSchema = z.object({
  id: z.number(),
  account_id: z.number(),
  category_id: z.number().optional().nullable(),
  amount: z.number().positive('El monto debe ser positivo'),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string().min(2, 'La descripción debe tener al menos 2 caracteres'),
  date: z.coerce.date(),
  notes: z.string().optional().nullable(),
  to_account_id: z.number().optional().nullable(),
  to_amount: z.number().positive().optional().nullable()
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
