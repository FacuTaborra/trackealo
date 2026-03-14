import { z } from 'zod';

export const deleteTransactionSchema = z.object({
  id: z.number()
});

export type DeleteTransactionInput = z.infer<typeof deleteTransactionSchema>;
