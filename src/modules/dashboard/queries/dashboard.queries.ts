import { useProfileQuery } from '@/modules/profile';
import { useAssessmentHistoryQuery } from '@/modules/assessment';

export function useDashboardQueries() {
  const profile = useProfileQuery();
  const history = useAssessmentHistoryQuery();
  return { profile, history, latest: history.isSuccess ? history.data[0] : undefined };
}
