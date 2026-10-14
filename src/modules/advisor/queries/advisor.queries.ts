import { useQuery } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { useSession } from '@/shared/session/session';
import { readAdvisorMessages, readAdvisorSessions } from '../api/advisor.api';

export const advisorMessagesKey = (ownerId: number, revision: number, sessionId: number) => ['advisor', 'messages', ownerId, revision, sessionId] as const;
export function useAdvisorQueries(sessionId: number | null) {
  const http = useHttpClient(), current = useSession();
  const sessions = useQuery({
    queryKey: ['history', 'chats', current.user?.id, current.revision],
    queryFn: ({ signal }) => readAdvisorSessions(http, signal),
    enabled: current.status === 'authenticated', retry: false, staleTime: 30_000, refetchOnWindowFocus: false,
  });
  const messages = useQuery({
    queryKey: ['advisor', 'messages', current.user?.id, current.revision, sessionId],
    queryFn: ({ signal }) => { if (sessionId === null) throw new Error('Invalid session'); return readAdvisorMessages(http, sessionId, signal); },
    enabled: current.status === 'authenticated' && sessionId !== null, retry: false, staleTime: 0, refetchOnWindowFocus: false,
  });
  return { sessions, messages };
}
