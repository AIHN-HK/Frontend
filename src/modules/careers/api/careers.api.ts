import previewCatalogUrl from '../preview/catalog-preview.json?url&no-inline';
import { previewCatalogSchema, selectPreviewCareers } from '../model/career.types';
import type { ExplorerCriteria } from '../model/career.types';

// Local fixture asset, fetched only by /preview/careers. No career API exists yet.
export async function readPreviewCareers(criteria: ExplorerCriteria, signal: AbortSignal) {
  const response = await fetch(previewCatalogUrl, { signal, credentials: 'omit' });
  if (!response.ok) throw new Error('Preview source unavailable');
  const source = previewCatalogSchema.parse(await response.json());
  signal.throwIfAborted();
  return selectPreviewCareers(source.careers, criteria);
}
