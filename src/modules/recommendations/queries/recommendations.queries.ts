import { useQuery } from '@tanstack/react-query';
import { readPreviewRecommendation, readPreviewRecommendations } from '../api/recommendations.api';
import { isPreviewRecommendationId } from '../model/recommendation.types';
import type { PreviewScenario } from '../model/recommendation.types';

export function usePreviewRecommendations(scenario: PreviewScenario) {
  return useQuery({
    queryKey: ['recommendations-preview', 1, scenario],
    queryFn: ({ signal }) => readPreviewRecommendations(signal), enabled: scenario === 'ready' || scenario === 'stale',
    retry: false, staleTime: 60_000, refetchOnWindowFocus: false,
  });
}

export function usePreviewRecommendation(id: string | undefined) {
  return useQuery({ queryKey: ['recommendations-preview', 1, 'detail', id], queryFn: ({ signal }) => readPreviewRecommendation(id!, signal), enabled: isPreviewRecommendationId(id), retry: false, staleTime: 60_000, refetchOnWindowFocus: false });
}
