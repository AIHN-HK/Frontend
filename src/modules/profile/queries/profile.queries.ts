import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { useSession } from '@/shared/session/session';
import { readProfile } from '../api/profile.api';

export function useProfileQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: ['profile', current.user?.id, current.revision],
    queryFn: ({ signal }) => readProfile(http, signal),
    enabled: current.status === 'authenticated',
    retry: false,
  });
}
