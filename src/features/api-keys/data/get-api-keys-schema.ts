import { z } from 'zod';

export const apiKeySchema = z.object({
  id: z.number(),
  name: z.string(),
  key_prefix: z.string(),
  created_at: z.coerce.date(),
  last_used_at: z.coerce.date().nullable()
});

export type ApiKey = z.infer<typeof apiKeySchema>;
