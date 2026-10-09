type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<unknown>;
  multiRemove(keys: string[]): Promise<unknown>;
};
export type Session = { accessToken: string | null; refreshToken: string | null; userId: number | null };
export type LoginSession = { accessToken: string; refreshToken: string; user: { id: number; fullname: string } };
const keys = ['access_token', 'refresh_token', 'USER_NAME', 'USER_ID'];
export function createSessionManager(storage: Storage) {
  const listeners = new Set<(userId: number | null, reason: 'account' | 'token') => void | Promise<void>>();
  let blocked = false;
  let generation = 0;
  let pending: Promise<unknown> = Promise.resolve();
  const serial = <T>(fn: () => Promise<T>): Promise<T> => {
    const result = pending.then(fn);
    pending = result.then(() => undefined, () => undefined);
    return result;
  };
  const parse = (value: string | null) => { try { return value === null ? null : JSON.parse(value); } catch { return null; } };
  const read = async (): Promise<Session> => {
    const current = generation;
    if (blocked || parse(await storage.getItem('SESSION_SIGNED_OUT')) === true) return {accessToken: null, refreshToken: null, userId: null};
    const values = await Promise.all(['access_token', 'refresh_token', 'USER_ID'].map(k => storage.getItem(k)));
    if (blocked || current !== generation) return {accessToken: null, refreshToken: null, userId: null};
    const [accessToken, refreshToken, userId] = values.map(parse);
    return { accessToken: typeof accessToken === 'string' ? accessToken : null, refreshToken: typeof refreshToken === 'string' ? refreshToken : null, userId: Number.isSafeInteger(userId) && userId > 0 ? userId : null };
  };
  const notify = async (id: number | null, reason: 'account' | 'token' = 'account') => { for (const listener of listeners) await listener(id, reason); };
  const remove = async () => {
    blocked = true;
    generation++;
    await notify(null);
    // Tombstone remains even if credential deletion fails, including across restart.
    let failure: unknown;
    try { await storage.setItem('SESSION_SIGNED_OUT', 'true'); } catch (error) { failure = error; }
    try { await storage.multiRemove(keys); } catch (error) { failure = error; }
    if (failure) throw failure;
  };
  return {
    read,
    subscribe(listener: (userId: number | null, reason: 'account' | 'token') => void | Promise<void>) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    initialize: () => serial(async () => { const s = await read(); if (!s.accessToken || s.userId !== null) await notify(s.accessToken ? s.userId : null); }),
    establish: (session: LoginSession) => serial(async () => {
      if (!session.accessToken || !session.refreshToken || !Number.isSafeInteger(session.user.id) || session.user.id <= 0) throw new Error('Invalid login response');
      await remove();
      try {
        await storage.setItem('USER_ID', JSON.stringify(session.user.id));
        await storage.setItem('USER_NAME', JSON.stringify(session.user.fullname));
        await storage.setItem('refresh_token', JSON.stringify(session.refreshToken));
        await storage.setItem('access_token', JSON.stringify(session.accessToken));
        await storage.setItem('SESSION_SIGNED_OUT', 'false');
        blocked = false;
        await notify(session.user.id);
      } catch (error) { await remove(); throw error; }
    }),
    clear: (expectedToken?: string | null) => serial(async () => {
      if (expectedToken !== undefined && (await read()).accessToken !== expectedToken) return false;
      await remove(); return true;
    }),
    rotate: (expectedToken: string, tokens: { accessToken: string; refreshToken: string }) => serial(async () => {
      if ((await read()).accessToken !== expectedToken) return false;
      if (!tokens.accessToken || !tokens.refreshToken) throw new Error('Invalid refresh response');
      try {
        await storage.setItem('refresh_token', JSON.stringify(tokens.refreshToken));
        await storage.setItem('access_token', JSON.stringify(tokens.accessToken));
      } catch (error) { await remove(); throw error; }
      await notify((await read()).userId, 'token');
      return true;
    }),
  };
}
