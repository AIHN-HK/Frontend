import { afterEach, describe, expect, it, vi } from 'vitest';
import catalog from '@/modules/careers/preview/catalog-preview.json';
import output from '@/modules/recommendations/preview/recommendations-preview.json';
import { readPreviewRecommendations } from '@/modules/recommendations/api/recommendations.api';
import { joinPreviewRecommendations, previewRecommendationsSchema, readRecommendationView, sortPreviewRecommendations, writeRecommendationView } from '@/modules/recommendations/model/recommendation.types';
import { previewCatalogSchema } from '@/modules/careers/model/career.types';

const source = previewRecommendationsSchema.parse(output);
const joined = joinPreviewRecommendations(source, previewCatalogSchema.parse(catalog).careers);
afterEach(() => vi.unstubAllGlobals());
describe('recommendation preview output boundaries', () => {
  it('normalizes unknown/prototype URL values and retains only supported scenario/sort', () => {
    expect(readRecommendationView(new URLSearchParams('scenario=__proto__&sort=constructor'))).toEqual({ scenario: 'ready', sort: 'rank' });
    expect(writeRecommendationView({ scenario: 'stale', sort: 'name' }).toString()).toBe('scenario=stale&sort=name');
    expect(writeRecommendationView(readRecommendationView(new URLSearchParams('returnTo=https://evil.test&sort=name'))).toString()).toBe('sort=name');
  });
  it('preserves recommendation IDs and source ranks when sorting by Vietnamese names', () => {
    const sorted = sortPreviewRecommendations(joined.items, 'name');
    expect(sorted[0]?.recommendationId).toBe('preview-rec-security');
    expect(sorted[0]?.rank).toBe(3);
    expect(joined.items[0]?.recommendationId).toBe('preview-rec-software');
  });
  it('sorts nullable mock scores deterministically and never derives or changes their values', () => {
    const items = [
      { ...joined.items[0]!, mockMatchPercent: null },
      { ...joined.items[1]!, mockMatchPercent: 0 },
      { ...joined.items[2]!, mockMatchPercent: 89 },
      { ...joined.items[3]!, mockMatchPercent: 89 },
    ];
    expect(sortPreviewRecommendations(items, 'score').map(item => item.recommendationId)).toEqual(['preview-rec-security', 'preview-rec-designer', 'preview-rec-analyst', 'preview-rec-software']);
    expect(items.map(item => item.mockMatchPercent)).toEqual([null, 0, 89, 89]);
  });
  it('rejects invalid ownership-like references, rank duplicates, real-looking IDs and malformed scores', () => {
    for (const bad of [
      { ...output, kind: 'AI output' }, { ...output, context: { ...output.context, attemptRef: '812' } },
      { ...output, items: [output.items[0], output.items[0]] },
      { ...output, items: [{ ...output.items[0], recommendationId: '71' }] },
      { ...output, items: [{ ...output.items[0], mockMatchPercent: 101 }] },
      { ...output, items: [{ ...output.items[0], mockMatchPercent: '92' }] },
      { ...output, items: [{ ...output.items[0], rank: 0 }] },
    ]) expect(previewRecommendationsSchema.safeParse(bad).success).toBe(false);
  });
  it('never replaces an unknown career with the first catalog record', () => {
    expect(() => joinPreviewRecommendations({ ...source, items: [{ ...source.items[0]!, careerId: 'preview-unknown' }] }, previewCatalogSchema.parse(catalog).careers)).toThrow('Unknown fixture career');
    expect(joinPreviewRecommendations({ ...source, items: [] }, []).items).toEqual([]);
    const partial = joinPreviewRecommendations({ ...source, items: [{ ...source.items[0]!, mockMatchPercent: null, reason: null, skills: [] }] }, previewCatalogSchema.parse(catalog).careers);
    expect(partial.items[0]).toMatchObject({ mockMatchPercent: null, reason: null, skills: [] });
  });
  it('reads only local fixtures with cancellation and discards a body completed after abort', async () => {
    const controller = new AbortController();
    const fetch = vi.fn(async (url: string, options: RequestInit) => {
      expect(options).toEqual({ signal: controller.signal, credentials: 'omit' });
      return { ok: true, json: async () => url.includes('recommendations-preview') ? output : catalog };
    });
    vi.stubGlobal('fetch', fetch);
    const result = await readPreviewRecommendations(controller.signal);
    expect(result.items).toHaveLength(4);
    expect(result.items[0]).toMatchObject({ recommendationId: 'preview-rec-software', careerId: 'preview-software' });
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const call of fetch.mock.calls) expect(call[1]).toEqual({ signal: controller.signal, credentials: 'omit' });
    vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ ok: true, json: async () => { if (url.includes('recommendations-preview')) controller.abort(); return url.includes('recommendations-preview') ? output : catalog; } })));
    await expect(readPreviewRecommendations(controller.signal)).rejects.toThrow();
  });
});
