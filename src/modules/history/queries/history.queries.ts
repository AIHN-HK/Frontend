import { useEffect } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { useSession } from '@/shared/session/session';
import { readChatHistory, readTestHistoryPage } from '../api/history.api';
import type { HistoryCursor } from '../model/history.model';

export function useHistoryQueries(kind: 'tests' | 'chats') {
  const http = useHttpClient(), current = useSession(), authenticated = current.status === 'authenticated';
  const queryClient = useQueryClient(), ownerId = current.user?.id, revision = current.revision;
  useEffect(() => {
    const queryKey = kind === 'tests'
      ? ['history', 'chats', ownerId, revision]
      : ['assessment', 'history', ownerId, revision, 'timeline', { limit: 10 }];
    const inactive = queryClient.getQueryCache().find({ queryKey, exact: true });
    if (inactive && inactive.getObserversCount() <= 1) void queryClient.cancelQueries({ queryKey, exact: true });
  }, [kind, ownerId, revision, queryClient]);
  const tests = useInfiniteQuery({
    queryKey: ['assessment', 'history', current.user?.id, current.revision, 'timeline', { limit: 10 }],
    initialPageParam: null as HistoryCursor | null,
    queryFn: ({ signal, pageParam }) => readTestHistoryPage(http, pageParam, signal),
    getNextPageParam: page => page.nextCursor ?? undefined,
    enabled: authenticated && kind === 'tests', retry: false, retryOnMount: false, staleTime: 30_000, refetchOnWindowFocus: false,
  });
  const chats = useQuery({
    queryKey: ['history', 'chats', current.user?.id, current.revision],
    queryFn: ({ signal }) => readChatHistory(http, signal),
    enabled: authenticated && kind === 'chats', retry: false, retryOnMount: false, staleTime: 30_000, refetchOnWindowFocus: false,
  });
  return { tests, chats };
}
