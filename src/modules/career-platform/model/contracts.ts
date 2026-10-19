import { z } from "zod";
const score = z.number().finite().min(0).max(100);
export const vectorSchema = z.object({
  R: score,
  I: score,
  A: score,
  S: score,
  E: score,
  C: score,
});
export const codes = ["R", "I", "A", "S", "E", "C"] as const;
export const skillSchema = z.object({ id: z.string(), name: z.string() });
const sourceUrl = z
  .url()
  .refine((value) =>
    value.startsWith("https://www.onetonline.org/link/summary/"),
  );
export const careerSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  riasec: vectorSchema.refine(value=>Object.values(value).every(n=>n>=1&&n<=7)),
  sourceVersion: z.string(),
  sourceUrl,
  active: z.boolean(),
  revision: z.number().int().positive(),
  skills: z.array(
    z.object({
      skillId: z.string(),
      importance: z.number().min(0).max(5),
      level: z.number().min(0).max(5),
      skill: skillSchema,
    }),
  ),
});
export const catalogSchema = z.object({
  items: z.array(careerSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});
export const profileSchema = z.object({
  userId: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  skills: z.array(
    z.object({ skillId: z.string(), level: z.number().min(0).max(5) }),
  ),
  interests: vectorSchema.refine(value=>Object.values(value).every(n=>n<=5)).nullable(),
  targetCareerId: z.string().nullable(),
});
export const gapSchema = z.object({
  skillId: z.string(),
  importance: z.number(),
  level: z.number(),
  current: z.number().nullable(),
  gap: z.number().nullable(),
  priority: z.number().nullable(),
});
export const recommendationSchema = z
  .object({
    careerId: z.string(),
    title: z.string(),
    sourceVersion: z.string(),
    sourceUrl,
    score: score.nullable(),
    skillCoverage: z.number().min(0).max(1),
    components: z.object({
      riasec: score.nullable(),
      skills: score.nullable(),
      interests: score.nullable(),
    }),
    contributions: z.array(
      z.object({
        key: z.enum(["riasec", "skills", "interests"]),
        value: score,
        weight: z.number().min(0).max(1),
        contribution: score,
      }),
    ),
    missing: z.array(z.string()),
    gaps: z.array(gapSchema),
  })
  .superRefine((value, ctx) => {
    const sum = value.contributions.reduce((s, c) => s + c.contribution, 0);
    const weight = value.contributions.reduce((s, c) => s + c.weight, 0);
    if (
      value.score !== null &&
      (Math.abs(sum - value.score) > 0.001 || Math.abs(weight - 1) > 0.001)
    )
      ctx.addIssue({
        code: "custom",
        message: "Inconsistent ranking explanation",
      });
    for (const c of value.contributions)
      if (Math.abs(c.contribution - c.value * c.weight) > 0.001)
        ctx.addIssue({
          code: "custom",
          message: "Invalid component contribution",
        });
  });

export const runSchema = z.object({
  id: z.string(),
  userId: z.number().int().positive(),
  attemptId: z.number().int().positive(),
  algorithmVersion: z.string(),
  createdAt: z.string(),
  input: z.object({ profileRevision: z.number().int().nonnegative() }),
  items: z.array(recommendationSchema),
});
export const taskSchema = z.object({
  id: z.string(),
  skillId: z.string(),
  kind: z.string(),
  phase: z.number().int(),
  title: z.string(),
  done: z.boolean(),
  evidence: z.string(),
  position: z.number().int(),
});
export const goalSchema = z.object({
  id: z.string(),
  careerId: z.string(),
  title: z.string(),
  revision: z.number().int().positive(),
  createdAt: z.string(),
  tasks: z.array(taskSchema),
});
export const analyticsSchema = z.object({
  counts: z.object({
    assessments: z.number(),
    chats: z.number(),
    runs: z.number(),
  }),
  timeline: z.array(
    z.object({
      attemptId: z.number(),
      finishAt: z.string(),
      topCode: z.string(),
      scores: vectorSchema,
      normalized: vectorSchema.nullable(),
    }),
  ),
  delta: vectorSchema.nullable().or(
    z.object({
      R: z.number(),
      I: z.number(),
      A: z.number(),
      S: z.number(),
      E: z.number(),
      C: z.number(),
    }),
  ),
  goals: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      total: z.number(),
      completed: z.number(),
    }),
  ),
  timelineLimit: z.number(),
});
export type Career = z.infer<typeof careerSchema>;
export type CareerProfile = z.infer<typeof profileSchema>;
export type RecommendationRun = z.infer<typeof runSchema>;
export type Goal = z.infer<typeof goalSchema>;

export const componentLabels = {
  riasec: "Hình dạng RIASEC",
  skills: "Kỹ năng tự đánh giá",
  interests: "Sở thích bổ sung",
};
