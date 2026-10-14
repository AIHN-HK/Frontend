import { readPreviewCatalog } from '@/modules/careers';
import fixtureUrl from '../preview/recommendations-preview.json?url&no-inline';
import { isPreviewRecommendationId, joinPreviewRecommendations, previewRecommendationsSchema } from '../model/recommendation.types';

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

export async function readPreviewRecommendation(id: string, signal: AbortSignal) {
  if (!isPreviewRecommendationId(id)) throw new Error('Invalid preview recommendation');
  const source = await readPreviewRecommendations(signal);
  return { context: source.context, createdAt: source.createdAt, item: source.items.find(item => item.recommendationId === id) ?? null };
}
