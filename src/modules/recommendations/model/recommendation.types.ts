import { z } from 'zod';
import { isPreviewCareerId } from '@/modules/careers';
import type { PreviewCareer } from '@/modules/careers';

export const previewScenarios = {
  ready: 'Có gợi ý mẫu',
  'no-test': 'Chưa có trắc nghiệm',
  'no-profile': 'Thiếu hồ sơ',
  generating: 'Đang tạo · Minh họa',
  error: 'Lỗi tạo · Minh họa',
  empty: 'Không có gợi ý',
  stale: 'Hồ sơ đã đổi · Minh họa',
} as const;
export type PreviewScenario = keyof typeof previewScenarios;
export const previewSorts = {
  rank: 'Thứ tự nguồn mẫu',
  score: 'Điểm minh họa cao nhất',
  name: 'Tên nghề A–Z',
} as const;
export type PreviewSort = keyof typeof previewSorts;
export function isPreviewRecommendationId(id: string | undefined): id is string {
  return typeof id === 'string' && id.length <= 80 && /^preview-rec-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export function readRecommendationView(params: URLSearchParams): {
  scenario: PreviewScenario;
  sort: PreviewSort;
} {
  const scenario = params.get('scenario'),
    sort = params.get('sort');
  return {
    scenario: scenario && Object.hasOwn(previewScenarios, scenario) ? (scenario as PreviewScenario) : 'ready',
    sort: sort && Object.hasOwn(previewSorts, sort) ? (sort as PreviewSort) : 'rank',
  };
}
export function writeRecommendationView(view: { scenario: PreviewScenario; sort: PreviewSort }) {
  const params = new URLSearchParams();
  if (view.scenario !== 'ready') params.set('scenario', view.scenario);
  if (view.sort !== 'rank') params.set('sort', view.sort);
  return params;
}

// Only the local preview output, not a future recommendation service contract.
export const previewRecommendationsSchema = z
  .object({
    kind: z.literal('T14 UI fixtures'),
    version: z.literal(1),
    createdAt: z.iso.date(),
    context: z.object({
      attemptRef: z.string().regex(/^preview-attempt-[a-z0-9-]+$/),
      profileRevision: z.string().regex(/^preview-profile-v[1-9]\d*$/),
      hollandCode: z.string().regex(/^[RIASEC]{1,3}$/),
    }),
    items: z
      .array(
        z.object({
          recommendationId: z
            .string()
            .regex(/^preview-rec-[a-z0-9]+(?:-[a-z0-9]+)*$/)
            .max(80),
          careerId: z.string().refine(isPreviewCareerId),
          rank: z.number().int().positive(),
          mockMatchPercent: z.number().finite().min(0).max(100).nullable(),
          reason: z.string().trim().min(1).nullable(),
          skills: z.array(z.object({ label: z.string().trim().min(1), state: z.enum(['have', 'develop']) })),
        }),
      )
      .max(50),
  })
  .refine((source) => {
    const ids = source.items.map((item) => item.recommendationId),
      ranks = source.items.map((item) => item.rank);
    return new Set(ids).size === ids.length && new Set(ranks).size === ranks.length;
  }, 'Duplicate recommendation ID or source rank');

export type PreviewRecommendationSource = z.infer<typeof previewRecommendationsSchema>;
export type PreviewRecommendation = PreviewRecommendationSource['items'][number] & { career: PreviewCareer };
export type PreviewRecommendations = Omit<PreviewRecommendationSource, 'items'> & {
  items: PreviewRecommendation[];
};

export function joinPreviewRecommendations(
  source: PreviewRecommendationSource,
  careers: PreviewCareer[],
): PreviewRecommendations {
  const byId = new Map(careers.map((career) => [career.id, career]));
  return {
    ...source,
    items: source.items.map((item) => {
      const career = byId.get(item.careerId);
      if (!career) throw new Error('Unknown fixture career');
      return { ...item, career };
    }),
  };
}

export function sortPreviewRecommendations(items: PreviewRecommendation[], sort: PreviewSort) {
  return [...items].sort((a, b) => {
    if (sort === 'name') {
      const comparison = a.career.name.localeCompare(b.career.name, 'vi');
      if (comparison) return comparison;
    }
    if (sort === 'score') {
      if (a.mockMatchPercent === null && b.mockMatchPercent !== null) return 1;
      if (b.mockMatchPercent === null && a.mockMatchPercent !== null) return -1;
      const comparison = (b.mockMatchPercent ?? 0) - (a.mockMatchPercent ?? 0);
      if (comparison) return comparison;
    }
    return a.rank - b.rank || a.recommendationId.localeCompare(b.recommendationId);
  });
}
