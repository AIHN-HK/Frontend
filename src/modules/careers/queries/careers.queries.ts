import { useQuery } from '@tanstack/react-query';
import { readPreviewCareer, readPreviewCareers } from '../api/careers.api';
import { isPreviewCareerId } from '../model/career.types';
import type { ExplorerCriteria } from '../model/career.types';

export function usePreviewCareers(criteria: ExplorerCriteria) {
  return useQuery({
    queryKey: ['careers-preview', 1, criteria],
    queryFn: ({ signal }) => readPreviewCareers(criteria, signal),
    retry: false, staleTime: 60_000, refetchOnWindowFocus: false,
    // No previous-query placeholder: an obsolete result must not label a new URL.
  });
}

export function usePreviewCareer(id: string | undefined) {
  return useQuery({
    queryKey: ['careers-preview', 1, 'detail', id],
    queryFn: ({ signal }) => readPreviewCareer(id!, signal),
    enabled: isPreviewCareerId(id), retry: false, staleTime: 60_000, refetchOnWindowFocus: false,
  });
}
