import { z } from 'zod';

export const moduleRecordCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
});

export const moduleRecordUpdateSchema = z.object({
  id: z.string().trim().min(1, 'Record id is required.'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.'),
  status: z.enum(['active', 'inactive']),
});

export type ModuleRecordCreateInput = z.infer<typeof moduleRecordCreateSchema>;
export type ModuleRecordUpdateInput = z.infer<typeof moduleRecordUpdateSchema>;
