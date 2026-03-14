import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre debe tener máximo 50 caracteres')
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
