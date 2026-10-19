import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { ApiError } from '@/shared/api/api-error';
import { readAvatar, uploadAvatar } from '../api/avatar.api';
import type { ProfileScope } from '../model/profile.types';

const avatarKey = (scope: ProfileScope) => ['profile-avatar', scope.ownerId, scope.revision] as const;
export function useAvatarQuery() {
  const http = useHttpClient(), current = useSession();
  return useQuery({
    queryKey: avatarKey({ ownerId: current.user?.id ?? 0, revision: current.revision }),
    queryFn: ({ signal }) => readAvatar(http, signal),
    enabled: current.status === 'authenticated',
    retry: false,
  });
}

export function useAvatarMutation() {
  const http = useHttpClient(), client = useQueryClient();
  const valid = ({ scope, signal }: { scope: ProfileScope; signal: AbortSignal }) => {
    const current = session.read();
    return !signal.aborted && current.status === 'authenticated' && current.user?.id === scope.ownerId && current.revision === scope.revision;
  };
  return useMutation({
    mutationKey: ['profile-avatar', 'upload'],
    retry: false,
    mutationFn: async (command: { file: File; scope: ProfileScope; signal: AbortSignal }) => {
      if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
      await client.cancelQueries({ queryKey: avatarKey(command.scope), exact: true });
      if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
      await uploadAvatar(http, command.file, command.signal);
      try {
        const saved = await readAvatar(http, command.signal);
        if (!saved) throw new Error('Missing saved avatar');
        if (!valid(command)) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
        return saved;
      } catch {
        throw new ApiError('configuration', 'Chưa đọc lại được ảnh đã lưu.', undefined, true);
      }
    },
    onSuccess: (image, command) => {
      if (valid(command)) client.setQueryData(avatarKey(command.scope), image);
    },
  });
}
