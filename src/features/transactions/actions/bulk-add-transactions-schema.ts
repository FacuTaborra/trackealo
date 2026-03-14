import { z } from 'zod';

export const bulkAddTransactionsSchema = z.object({
  file: z.string()
});

export type BulkAddTransactionsInput = z.infer<
  typeof bulkAddTransactionsSchema
>;
