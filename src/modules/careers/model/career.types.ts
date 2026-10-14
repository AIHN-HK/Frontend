import { z } from 'zod';

export const riasecLabels = { R: 'Thực tế', I: 'Nghiên cứu', A: 'Nghệ thuật', S: 'Xã hội', E: 'Quản lý', C: 'Nghiệp vụ' } as const;
export type Riasec = keyof typeof riasecLabels;
export const categories = [
  { id: 'technology', name: 'Công nghệ thông tin', icon: '💻' },
  { id: 'data', name: 'Dữ liệu & Trí tuệ nhân tạo', icon: '📊' },
  { id: 'creative', name: 'Thiết kế & Sáng tạo', icon: '🎨' },
  { id: 'health', name: 'Y tế & Tâm lý học', icon: '🩺' },
  { id: 'business', name: 'Kinh doanh & Quản trị', icon: '📈' },
] as const;
export type CategoryId = typeof categories[number]['id'];

export function isPreviewCareerId(id: string | undefined): id is string {
  return typeof id === 'string' && id.length <= 80 && /^preview-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

export function isSafeCareerReference(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && Boolean(parsed.hostname) && !parsed.username && !parsed.password;
  } catch { return false; }
}

const textList = z.array(z.string().trim().min(1));
const detailSchema = z.object({
  kind: z.literal('T13 UI fixtures'), updatedAt: z.iso.date(),
  tasks: textList.optional(), hardSkills: textList.optional(), softSkills: textList.optional(),
  references: z.array(z.object({
    label: z.string().trim().min(1), url: z.string().refine(isSafeCareerReference, 'Unsafe reference URL'), checkedAt: z.iso.date(),
  })).refine(items => new Set(items.map(item => item.url)).size === items.length, 'Duplicate reference URL').optional(),
});

// Preview-only schema. This does not define or imply a backend catalog contract.
const careerSchema = z.object({
  id: z.string().refine(isPreviewCareerId, 'Invalid fixture ID'),
  name: z.string().min(1), category: z.enum(['technology', 'data', 'creative', 'health', 'business']),
  riasec: z.array(z.enum(['R', 'I', 'A', 'S', 'E', 'C'])).min(1), summary: z.string().min(1),
  detail: detailSchema.optional(),
});
export const previewCatalogSchema = z.object({
  kind: z.literal('T12 UI fixtures'), version: z.literal(1), careers: z.array(careerSchema),
}).refine(data => new Set(data.careers.map(c => c.id)).size === data.careers.length, 'Duplicate fixture ID');
export type PreviewCareer = z.infer<typeof careerSchema>;
export type ExplorerCriteria = { q: string; categories: CategoryId[]; riasec: Riasec[]; page: number };
export const previewPageSize = 4;

export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function readExplorerCriteria(params: URLSearchParams): ExplorerCriteria {
  const page = Number(params.get('page') ?? '1');
  return {
    q: (params.get('q') ?? '').trim().replace(/\s+/g, ' '),
    categories: categories.map(c => c.id).filter(id => params.getAll('category').includes(id)),
    riasec: (Object.keys(riasecLabels) as Riasec[]).filter(code => params.getAll('riasec').includes(code)),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function writeExplorerCriteria(criteria: ExplorerCriteria): URLSearchParams {
  const params = new URLSearchParams();
  if (criteria.q) params.set('q', criteria.q.trim().replace(/\s+/g, ' '));
  for (const category of categories) if (criteria.categories.includes(category.id)) params.append('category', category.id);
  for (const code of Object.keys(riasecLabels) as Riasec[]) if (criteria.riasec.includes(code)) params.append('riasec', code);
  if (criteria.page > 1) params.set('page', String(criteria.page));
  return params;
}

export function selectPreviewCareers(careers: PreviewCareer[], criteria: ExplorerCriteria) {
  const words = normalizeSearch(criteria.q).split(' ').filter(Boolean);
  const matching = careers.filter(career => {
    const text = normalizeSearch(`${career.name} ${career.summary}`);
    return words.every(word => text.includes(word))
      && (!criteria.categories.length || criteria.categories.includes(career.category))
      && (!criteria.riasec.length || criteria.riasec.some(code => career.riasec.includes(code)));
  });
  const offset = (criteria.page - 1) * previewPageSize;
  return {
    items: matching.slice(offset, offset + previewPageSize), total: matching.length,
    pages: Math.ceil(matching.length / previewPageSize),
    categoryCounts: Object.fromEntries(categories.map(category => [category.id, careers.filter(c => c.category === category.id).length])),
  };
}
