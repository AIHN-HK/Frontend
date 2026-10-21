import { z } from 'zod';
import { riasecSchema, idSchema } from '../../model/contracts';
export const priorityItem = z.object({ type: riasecSchema, priority: z.number().int().min(1).max(6) });
export const prioritiesSchema = z
  .array(priorityItem)
  .length(6)
  .refine(
    (rows) => new Set(rows.map((r) => r.type)).size === 6 && new Set(rows.map((r) => r.priority)).size === 6,
    'Cần đủ sáu nhóm với thứ tự duy nhất từ 1 đến 6.',
  );
export const contentSchema = z.object({
  code: riasecSchema,
  title: z.string().trim().min(1),
  personality: z.array(z.string().trim().min(1)).min(1),
  strengths: z.array(z.string().trim().min(1)).min(1),
  weaknesses: z.array(z.string().trim().min(1)).min(1),
  careers: z.array(z.string().trim().min(1)).min(1),
});
// Existing/partially configured content must remain readable so an admin can
// complete it. Saving still uses the stricter contentSchema above.
export const topcodesSchema = z.array(contentSchema.extend({
  id: idSchema,
  title: z.string(),
  personality: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  careers: z.array(z.string()),
}));
export const contentDraftSchema = z.object({
  title: z.string(),
  personality: z.string(),
  strengths: z.string(),
  weaknesses: z.string(),
  careers: z.string(),
});
export type ContentRecord = z.infer<typeof contentSchema>;
