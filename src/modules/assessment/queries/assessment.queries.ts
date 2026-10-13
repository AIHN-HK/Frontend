import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { useSession } from '@/shared/session/session';
import { readAssessmentHistory } from '../api/assessment.api';

export function useAssessmentHistoryQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['assessment', 'history', current.user?.id, current.revision, { limit: 10 }],
    queryFn: ({ signal }) => readAssessmentHistory(http, signal),
    enabled: current.status === 'authenticated',
    retry: false,
  });
}
