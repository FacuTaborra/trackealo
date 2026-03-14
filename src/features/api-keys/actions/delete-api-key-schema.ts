import { z } from 'zod';

export const deleteApiKeySchema = z.object({
  id: z.number()
});

export type DeleteApiKeyInput = z.infer<typeof deleteApiKeySchema>;
