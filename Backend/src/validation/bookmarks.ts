import { z } from 'zod';

export const bookmarkListSchema = z.strictObject({
  page: z.coerce.number().int().min(1).max(100_000).optional(),
  jobIds: z.preprocess(value => typeof value === 'string' ? [value] : value,
    z.array(z.string().uuid()).max(20).optional()),
}).refine(value => !value.page || !value.jobIds, 'Use either page or jobIds');
