import { readPreviewCatalog } from '@/modules/careers';
import fixtureUrl from '../preview/recommendations-preview.json?url&no-inline';
import { joinPreviewRecommendations, previewRecommendationsSchema } from '../model/recommendation.types';

export async function readPreviewRecommendations(signal: AbortSignal) {
  // Static local fixtures only. No recommendation endpoint, generation or mutation.
  const [response, careers] = await Promise.all([
    fetch(fixtureUrl, { signal, credentials: 'omit' }), readPreviewCatalog(signal),
  ]);
  if (!response.ok) throw new Error('Preview output unavailable');
  const source = previewRecommendationsSchema.parse(await response.json());
  signal.throwIfAborted();
  return joinPreviewRecommendations(source, careers);
}
