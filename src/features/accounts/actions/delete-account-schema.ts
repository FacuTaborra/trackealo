import { z } from 'zod';

export const deleteAccountSchema = z.object({
  id: z.number()
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
