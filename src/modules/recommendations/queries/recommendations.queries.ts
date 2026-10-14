import { useQuery } from '@tanstack/react-query';
import { readPreviewRecommendations } from '../api/recommendations.api';
import type { PreviewScenario } from '../model/recommendation.types';

export function usePreviewRecommendations(scenario: PreviewScenario) {
  return useQuery({
    queryKey: ['recommendations-preview', 1, scenario],
    queryFn: ({ signal }) => readPreviewRecommendations(signal), enabled: scenario === 'ready' || scenario === 'stale',
    retry: false, staleTime: 60_000, refetchOnWindowFocus: false,
  });
}
