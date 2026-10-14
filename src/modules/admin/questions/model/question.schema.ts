import { z } from 'zod';
import { idSchema, riasecSchema } from '../../model/contracts';
export const dimensionSchema = z.enum(['PERSONA', 'ABILITY', 'INTEREST']);
export const questionInputSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  type: riasecSchema,
  dimension: dimensionSchema,
});
export const questionRecordSchema = z.object({
  id: idSchema,
  content: z.string(),
  type: riasecSchema,
  dimension: dimensionSchema.nullable(),
});
export const questionBankSchema = z.object({
  activeAttempts: z.number().int().nonnegative(),
  items: z.array(questionRecordSchema.extend({ editable: z.boolean(), used: z.boolean() })),
});
export type QuestionRecord = z.infer<typeof questionBankSchema>['items'][number];
// Draft accepts temporarily empty text; submit validation remains stricter.
export const questionDraftSchema = questionInputSchema.extend({ content: z.string().max(2000) });
