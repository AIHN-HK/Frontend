import { useQuery } from '@tanstack/react-query';
import { readPreviewCareers } from '../api/careers.api';
import type { ExplorerCriteria } from '../model/career.types';

export function usePreviewCareers(criteria: ExplorerCriteria) {
  return useQuery({
    queryKey: ['careers-preview', 1, criteria],
    queryFn: ({ signal }) => readPreviewCareers(criteria, signal),
    retry: false, staleTime: 60_000, refetchOnWindowFocus: false,
    // No previous-query placeholder: an obsolete result must not label a new URL.
  });
}
