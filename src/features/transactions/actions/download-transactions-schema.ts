import { z } from 'zod';

export const downloadTransactionsSchema = z.object({
  accountId: z.number().optional(),
  categoryId: z.number().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  ids: z.array(z.number()).optional()
});

export type DownloadTransactionsInput = z.infer<
  typeof downloadTransactionsSchema
>;
