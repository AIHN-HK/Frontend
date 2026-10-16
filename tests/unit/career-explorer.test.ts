import { describe, expect, it } from 'vitest';
import { previewCatalogSchema, readExplorerCriteria, selectPreviewCareers, writeExplorerCriteria } from '@/modules/careers/model/career.types';
import fixture from '@/modules/careers/preview/catalog-preview.json';

const careers = previewCatalogSchema.parse(fixture).careers;
const criteria = (query: string) => readExplorerCriteria(new URLSearchParams(query));
describe('career preview search and source boundaries', () => {
  it('ignores invalid or duplicate filters and malformed pages while keeping valid values', () => {
    expect(criteria('category=data&category=data&category=unknown&riasec=I&riasec=I&riasec=X&page=-2')).toEqual({ q: '', categories: ['data'], riasec: ['I'], page: 1 });
    for (const page of ['NaN', 'Infinity', '1.5', '0', '9007199254740992']) expect(criteria(`page=${page}`).page).toBe(1);
  });
  it('canonicalizes parameter order and whitespace for shareable filter URLs', () => {
    const selection = criteria('riasec=C&category=health&riasec=R&category=data&q=++điều+++dưỡng++&page=2');
    expect(writeExplorerCriteria(selection).toString()).toBe('q=%C4%91i%E1%BB%81u+d%C6%B0%E1%BB%A1ng&category=data&category=health&riasec=R&riasec=C&page=2');
    expect(criteria(writeExplorerCriteria(selection).toString())).toEqual(selection);
  });
  it('searches all words across name/summary, handling decomposed accents and Vietnamese đ', () => {
    expect(selectPreviewCareers(careers, criteria('q=DIEU+DUONG')).items.map(c => c.id)).toEqual(['preview-nurse']);
    expect(selectPreviewCareers(careers, criteria(`q=${encodeURIComponent('Điều dưỡng')}`)).items.map(c => c.id)).toEqual(['preview-nurse']);
    expect(selectPreviewCareers(careers, criteria('q=he+thong+bao+ve')).items.map(c => c.id)).toEqual(['preview-security']);
  });
  it('uses OR within groups and AND across search/category/RIASEC', () => {
    const result = selectPreviewCareers(careers, criteria('category=data&category=technology&riasec=R&riasec=C&q=du+lieu'));
    expect(result.items.map(c => c.id)).toEqual(['preview-software', 'preview-data-engineer', 'preview-analyst']);
    expect(selectPreviewCareers(careers, criteria('category=data&riasec=S')).total).toBe(0);
  });
  it('derives totals/facets from the actual source and never fabricates a page for out-of-range URLs', () => {
    const result = selectPreviewCareers(careers, criteria('category=data&page=999'));
    expect(result).toMatchObject({ items: [], total: 2, pages: 1, categoryCounts: { data: 2, technology: 3 } });
    expect(selectPreviewCareers([], criteria(''))).toMatchObject({ items: [], total: 0, pages: 0 });
  });
  it('rejects real-looking or duplicate IDs and wrong fixture provenance', () => {
    for (const invalid of [
      { ...fixture, kind: 'catalog' },
      { ...fixture, careers: [{ ...careers[0], id: '15-1252.00' }] },
      { ...fixture, careers: [careers[0], careers[0]] },
      { ...fixture, careers: [{ ...careers[0], riasec: ['X'] }] },
    ]) expect(previewCatalogSchema.safeParse(invalid).success).toBe(false);
  });
});
