import { ApiError, normalizeApiError } from '@/shared/api/api-error';
import type { SessionStore } from '@/shared/session/session.types';
import type { AuthApi, AuthController, AuthPersistence } from './auth.types';

export function createAuthController(options: { api: AuthApi; session: SessionStore; persistence: AuthPersistence; withRefreshLock?: <T>(run: () => Promise<T>) => Promise<T> }): AuthController {
  const { api, session, persistence } = options;
  const lock = options.withRefreshLock ?? (<T>(run: () => Promise<T>) => run());
  let disposed = false;
  let loginTask: Promise<void> | null = null;
  let restoreTask: Promise<void> | null = null;
  let refreshTask: { revision: number; promise: Promise<boolean> } | null = null;
  let message: string | null = null;
  const notices = new Set<() => void>();
  const notice = (value: string | null) => { message = value; for (const listener of notices) listener(); };
  const guard = (revision: number) => {
    if (disposed || session.read().revision !== revision) throw new ApiError('session-changed', 'Phiên đã thay đổi. Vui lòng đăng nhập lại.');
  };
  const saved = (userId: number, tokens: { accessToken: string; refreshToken: string }, rememberMe: boolean) => {
    if (!persistence.save({ version: 1, ownerId: userId, tokens, rememberMe })) {
      throw new ApiError('configuration', 'Trình duyệt không thể lưu phiên đăng nhập. Vui lòng kiểm tra quyền lưu trữ rồi thử lại.');
    }
  };
  const invalidate = (revision: number) => {
    if (session.read().revision !== revision) return;
    const token = session.read().tokens?.refreshToken;
    if (token) persistence.clear(token);
    session.clear(revision);
  };
  const hydrate = (): Promise<void> => {
    if (restoreTask) return restoreTask;
    const record = persistence.read();
    if (!record || disposed) return Promise.resolve();
    session.loading();
    const revision = session.read().revision;
    let verifyingRecord = record;
    const operation = lock(async () => {
      try {
        guard(revision);
        const latest = persistence.read();
        if (!latest || latest.ownerId !== record.ownerId) throw new ApiError('session-changed', 'Phiên lưu trên thiết bị đã thay đổi.');
        verifyingRecord = latest;
        let tokens = latest.tokens;
        let user;
        try { user = await api.identity(tokens.accessToken); }
        catch (error) {
          if (!(error instanceof ApiError) || error.status !== 401) throw error;
          guard(revision);
          tokens = await api.refresh(tokens.refreshToken);
          guard(revision);
          user = await api.identity(tokens.accessToken);
        }
        guard(revision);
        const stillSaved = persistence.read();
        if (!stillSaved || stillSaved.ownerId !== latest.ownerId || stillSaved.tokens.refreshToken !== latest.tokens.refreshToken) throw new ApiError('session-changed', 'Phiên lưu trên thiết bị đã thay đổi.');
        if (user.id !== latest.ownerId) throw new ApiError('configuration', 'Không thể xác minh chủ sở hữu phiên đăng nhập.');
        saved(user.id, tokens, latest.rememberMe);
        session.establish(user, tokens);
        notice(null);
      } catch (error) {
        if (disposed || session.read().revision !== revision) return;
        persistence.clear(verifyingRecord.tokens.refreshToken);
        session.clear(revision);
        notice(error instanceof ApiError && error.kind === 'session-changed' ? error.message : 'Không thể khôi phục phiên. Vui lòng đăng nhập lại.');
      }
    });
    restoreTask = operation;
    void operation.finally(() => { if (restoreTask === operation) restoreTask = null; }).catch(() => {});
    return operation;
  };
  return {
    read: session.read,
    subscribe: session.subscribe,
    notice: () => message,
    subscribeNotice: listener => { notices.add(listener); return () => { notices.delete(listener); }; },
    login: (input, loginOptions) => {
      if (loginTask || restoreTask) return Promise.reject(new ApiError('configuration', 'Đang xử lý đăng nhập. Vui lòng chờ.'));
      if (session.read().status !== 'anonymous') invalidate(session.read().revision);
      const revision = session.read().revision;
      notice(null);
      const operation = (async () => {
        try {
          const result = await api.login(input);
          guard(revision);
          const user = result.user.role === null ? await api.identity(result.tokens.accessToken) : result.user;
          guard(revision);
          if (user.id !== result.user.id) throw new ApiError('configuration', 'Không thể xác minh tài khoản.');
          saved(user.id, result.tokens, loginOptions.rememberMe);
          session.establish(user, result.tokens);
        } catch (error) { throw normalizeApiError(error, true); }
      })();
      loginTask = operation;
      void operation.finally(() => { if (loginTask === operation) loginTask = null; }).catch(() => {});
      return operation;
    },
    logout: async () => {
      const current = session.read();
      const removed = persistence.clear();
      session.clear(current.revision);
      const revision = session.read().revision;
      loginTask = null; restoreTask = null; refreshTask = null;
      notice(null);
      try {
        if (current.tokens) await api.logout(current.tokens.accessToken);
        if (!removed) throw new ApiError('configuration', 'Không thể xóa phiên đã lưu trên trình duyệt. Vui lòng kiểm tra quyền lưu trữ.');
      } catch (error) {
        if (!disposed && session.read().revision === revision) notice(error instanceof ApiError && error.kind === 'configuration' ? error.message : 'Đã đăng xuất trên thiết bị này. Chưa xác nhận được việc thu hồi phiên trên máy chủ.');
        throw normalizeApiError(error, true);
      }
    },
    hydrate,
    refresh: revision => {
      if (refreshTask?.revision === revision) return refreshTask.promise;
      const current = session.read();
      if (current.revision !== revision || !current.user || !current.tokens || disposed) return Promise.resolve(false);
      const operation = lock(async () => {
        try {
          guard(revision);
          const record = persistence.read();
          if (record && record.ownerId !== current.user!.id) throw new ApiError('session-changed', 'Tài khoản đã thay đổi.');
          const previous = record?.tokens ?? current.tokens!;
          // A different tab may have rotated while this tab waited for its lock.
          const tokens = previous.accessToken !== current.tokens!.accessToken ? previous : await api.refresh(previous.refreshToken);
          guard(revision);
          const user = await api.identity(tokens.accessToken);
          guard(revision);
          if (user.id !== current.user!.id) throw new ApiError('session-changed', 'Tài khoản đã thay đổi.');
          const latest = persistence.read();
          if ((record && !latest) || (latest && (latest.ownerId !== current.user!.id || latest.tokens.refreshToken !== previous.refreshToken))) throw new ApiError('session-changed', 'Phiên đã thay đổi.');
          saved(user.id, tokens, record?.rememberMe ?? false);
          return session.rotate(tokens, revision, user);
        } catch {
          if (!disposed && session.read().revision === revision) { invalidate(revision); notice('Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.'); }
          return false;
        }
      });
      refreshTask = { revision, promise: operation };
      void operation.finally(() => { if (refreshTask?.promise === operation) refreshTask = null; }).catch(() => {});
      return operation;
    },
    unauthorized: revision => {
      if (disposed || session.read().revision !== revision) return;
      invalidate(revision); notice('Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại.');
    },
    synchronize: async () => {
      if (disposed || persistence.read()?.rememberMe === false) return;
      session.clear(); loginTask = null; restoreTask = null; refreshTask = null;
      await hydrate();
    },
    dispose: () => { disposed = true; notices.clear(); },
  };
}
