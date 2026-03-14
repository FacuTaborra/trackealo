import { z } from 'zod';

export const transactionAccountSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  currency: z.string()
});

export const transactionCategorySchema = z.object({
  id: z.number(),
  name: z.string()
});

export const transactionSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  account_id: z.number(),
  category_id: z.number().nullable(),
  amount: z.number(),
  type: z.enum(['income', 'expense', 'transfer']),
  description: z.string(),
  date: z.coerce.date(),
  notes: z.string().nullable(),
  to_account_id: z.number().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  account: transactionAccountSchema.nullable(),
  category: transactionCategorySchema.nullable()
});

export type Transaction = z.infer<typeof transactionSchema>;

export const getTransactionsSchema = z.object({
  accountId: z.number().optional(),
  categoryId: z.number().optional(),
  type: z.enum(['income', 'expense', 'transfer']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(),
  ids: z.array(z.number()).optional()
});

export type GetTransactionsInput = z.infer<typeof getTransactionsSchema>;
