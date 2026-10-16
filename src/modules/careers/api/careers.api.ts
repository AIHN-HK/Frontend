import previewCatalogUrl from '../preview/catalog-preview.json?url&no-inline';
import { isPreviewCareerId, previewCatalogSchema, selectPreviewCareers } from '../model/career.types';
import type { ExplorerCriteria } from '../model/career.types';

// Local fixture asset, fetched only by career preview routes. No career API exists yet.
export async function readPreviewCatalog(signal: AbortSignal) {
  const response = await fetch(previewCatalogUrl, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error('Preview source unavailable');
  const source = previewCatalogSchema.parse(await response.json());
  signal.throwIfAborted();
  return source.careers;
}

export async function readPreviewCareers(criteria: ExplorerCriteria, signal: AbortSignal) {
  return selectPreviewCareers(await readPreviewCatalog(signal), criteria);
}

export async function readPreviewCareer(id: string, signal: AbortSignal) {
  if (!isPreviewCareerId(id)) throw new Error('Invalid fixture ID');
  const careers = await readPreviewCatalog(signal);
  return careers.find(career => career.id === id) ?? null;
}
