import { afterEach, describe, expect, it, vi } from 'vitest';
import catalog from '@/modules/careers/preview/catalog-preview.json';
import { readPreviewCareer } from '@/modules/careers/api/careers.api';
import { isPreviewCareerId, isSafeCareerReference, previewCatalogSchema } from '@/modules/careers/model/career.types';

afterEach(() => vi.unstubAllGlobals());
describe('preview career detail identity and provenance boundaries', () => {
  it('accepts only bounded opaque preview IDs, rejecting separators and real-looking identifiers', () => {
    expect(isPreviewCareerId('preview-data-engineer')).toBe(true);
    for (const invalid of [undefined, '', '123', '15-1252.00', 'preview-', 'preview-a--b', 'preview-a/b', 'preview-a%2fb', `preview-${'a'.repeat(81)}`]) expect(isPreviewCareerId(invalid)).toBe(false);
  });
  it('rejects executable/insecure/malformed or credential-bearing reference URLs', () => {
    expect(isSafeCareerReference('https://developer.mozilla.org/en-US/docs/Learn_web_development')).toBe(true);
    for (const url of ['javascript:alert(1)', 'data:text/html,unsafe', 'http://example.test', '//example.test', '/docs', 'https://user:secret@example.test', 'not-a-url']) expect(isSafeCareerReference(url)).toBe(false);
  });
  it('requires explicit fixture provenance, valid calendar dates and distinct reference URLs', () => {
    const career = catalog.careers[0]!, detail = career.detail!;
    for (const badDetail of [
      { ...detail, kind: 'O*NET' }, { ...detail, updatedAt: '2026-02-30' },
      { ...detail, references: [{ ...detail.references[0], checkedAt: 'today' }] },
      { ...detail, references: [detail.references[0], detail.references[0]] },
      { ...detail, tasks: [''] },
    ]) expect(previewCatalogSchema.safeParse({ ...catalog, careers: [{ ...career, detail: badDetail }] }).success).toBe(false);
  });
  it('reads exact IDs with cancellation and keeps a genuine missing record distinct from a failed read', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => catalog });
    vi.stubGlobal('fetch', fetch);
    const signal = new AbortController().signal;
    expect((await readPreviewCareer('preview-data-engineer', signal))?.name).toBe('Kỹ sư Dữ liệu');
    expect(fetch.mock.calls[0]?.[1]).toEqual({ signal, credentials: 'omit' });
    await expect(readPreviewCareer('preview-no-such-career', signal)).resolves.toBeNull();
    fetch.mockResolvedValueOnce({ ok: false });
    await expect(readPreviewCareer('preview-software', signal)).rejects.toThrow('Preview source unavailable');
  });
  it('preserves partial content without borrowing tasks or references from another career', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => catalog }));
    const partial = await readPreviewCareer('preview-nurse', new AbortController().signal);
    expect(partial?.detail).toBeUndefined();
    expect(partial?.name).toBe('Điều dưỡng');
    const emptyDetail = { kind: 'T13 UI fixtures', updatedAt: '2026-10-14', tasks: [], hardSkills: [], softSkills: [], references: [] };
    expect(previewCatalogSchema.parse({ ...catalog, careers: [{ ...catalog.careers[0], detail: emptyDetail }] }).careers[0]?.detail?.tasks).toEqual([]);
  });
  it('does not fetch malformed IDs and does not return a response after cancellation during body parsing', async () => {
    const controller = new AbortController();
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => { controller.abort(); return catalog; } });
    vi.stubGlobal('fetch', fetch);
    await expect(readPreviewCareer('real-id', controller.signal)).rejects.toThrow('Invalid fixture ID');
    expect(fetch).not.toHaveBeenCalled();
    await expect(readPreviewCareer('preview-software', controller.signal)).rejects.toThrow();
  });
});
