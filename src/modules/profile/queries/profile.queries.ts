import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { ApiError } from '@/shared/api/api-error';
import { readProfile, updateProfile } from '../api/profile.api';
import type { ProfilePatch, ProfileScope } from '../model/profile.types';

const profileKey = (scope: ProfileScope) => ['profile', scope.ownerId, scope.revision] as const;

export function useProfileQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: profileKey({ ownerId: current.user?.id ?? 0, revision: current.revision }),
    queryFn: ({ signal }) => readProfile(http, signal),
    enabled: current.status === 'authenticated',
    retry: false,
  });
}

export function useProfileMutation() {
  const http = useHttpClient(), queryClient = useQueryClient();
  const valid = ({ scope, signal }: { scope: ProfileScope; signal: AbortSignal }) => {
    const current = session.read();
    return !signal.aborted && current.status === 'authenticated' && current.user?.id === scope.ownerId && current.revision === scope.revision;
  };
  return useMutation({
    mutationKey: ['profile', 'update'],
    retry: false,
    mutationFn: async (command: { input: ProfilePatch; scope: ProfileScope; signal: AbortSignal }) => {
      if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
      await queryClient.cancelQueries({ queryKey: profileKey(command.scope), exact: true });
      if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
      const profile = await updateProfile(http, command.input, command.signal);
      if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
      return profile;
    },
    onSuccess: (profile, command) => {
      if (!valid(command)) return;
      queryClient.setQueryData(profileKey(command.scope), profile);
      const current = session.read();
      if (current.user && current.tokens) session.rotate(current.tokens, current.revision, { ...current.user, fullname: profile.fullname });
      void queryClient.invalidateQueries({ queryKey: profileKey(command.scope), exact: true });
    },
  });
}
