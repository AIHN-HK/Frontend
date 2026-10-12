import { afterEach, expect, it } from 'vitest';
import { createServer } from 'node:http';
import type { Server, RequestListener } from 'node:http';
import { createSessionStore } from '@/shared/session/session';
import { createHttpClient } from '@/shared/api/http-client';
import { createAuthApi } from '@/modules/auth/api/auth.api';
import { createAuthController } from '@/modules/auth/model/auth-controller';
import { AUTH_STORAGE_KEY, createAuthPersistence } from '@/modules/auth/model/session-persistence';
import { postLoginPath } from '@/modules/auth/model/post-login-path';
import type { AuthApi } from '@/modules/auth/model/auth.types';
import { createAppRuntime } from '@/app/bootstrap';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

const servers: Server[] = [];
async function serve(handler: RequestListener) {
  const server = createServer(handler); servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No server address');
  return `http://127.0.0.1:${address.port}`;
}
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))); });
const user = { id: 1, fullname: 'Alice', role: 'USER' as const };
const tokens = { accessToken: 'old-access', refreshToken: 'refresh' };

function memoryPort() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
async function authFixture(options: { role?: 'USER' | 'ADMIN' | null; invalid?: boolean; expired?: boolean; refreshFails?: boolean; logoutFails?: boolean } = {}) {
  const calls: { path: string; authorization: string | undefined; body: unknown }[] = [];
  const role = options.role ?? 'USER';
  const origin = await serve((request, response) => {
    let body = ''; request.on('data', chunk => { body += String(chunk); });
    request.on('end', () => {
      const path = request.url ?? '';
      calls.push({ path, authorization: request.headers.authorization, body: body ? JSON.parse(body) as unknown : null });
      response.setHeader('Content-Type', 'application/json');
      let data: unknown;
      if (path.endsWith('/login')) {
        if (options.invalid) { response.writeHead(401); response.end('{}'); return; }
        data = { user: { ...user, role: options.role === null ? null : role }, ...tokens };
      } else if (path.endsWith('/refresh')) {
        if (options.refreshFails) { response.writeHead(503); response.end('{}'); return; }
        data = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      } else if (path.endsWith('/test-authorization') || path.endsWith('/admin/me')) {
        if (options.expired && request.headers.authorization === 'Bearer old-access') { response.writeHead(401); response.end('{}'); return; }
        if (role === 'ADMIN' && path.endsWith('/test-authorization')) { response.writeHead(403); response.end('{}'); return; }
        data = { ...user, role };
      } else if (path.endsWith('/logout')) {
        response.writeHead(options.logoutFails ? 503 : 204); response.end(); return;
      } else { response.writeHead(404); response.end('{}'); return; }
      response.end(JSON.stringify({ status: 200, data, errors: null }));
    });
  });
  const session = createSessionStore(), local = memoryPort(), tab = memoryPort();
  const persistence = createAuthPersistence(local, tab);
  const raw = createHttpClient({ origin, session, credentials: 'explicit', onUnauthorized: () => {} });
  const auth = createAuthController({ api: createAuthApi(raw), session, persistence });
  return { calls, auth, session, persistence, local, tab };
}

it('wrong credentials leave the client anonymous and never persist a password', async () => {
  const { auth, session, local, tab } = await authFixture({ invalid: true });
  await expect(auth.login({ email: 'alice@example.test', password: 'wrong' }, { rememberMe: true })).rejects.toMatchObject({ status: 401 });
  expect(session.read().status).toBe('anonymous');
  expect(local.getItem(AUTH_STORAGE_KEY)).toBeNull(); expect(tab.getItem(AUTH_STORAGE_KEY)).toBeNull();
});

it.each([false, true])('rememberMe=%s controls client persistence without changing the BE login payload', async rememberMe => {
  const { auth, session, local, tab, calls } = await authFixture();
  await auth.login({ email: ' alice@example.test ', password: ' exact password ' }, { rememberMe });
  expect(session.read().user).toEqual(user);
  expect(calls[0]?.body).toEqual({ email: 'alice@example.test', password: ' exact password ' });
  expect((rememberMe ? local : tab).getItem(AUTH_STORAGE_KEY)).not.toContain('password');
  expect((rememberMe ? tab : local).getItem(AUTH_STORAGE_KEY)).toBeNull();
});

it('hydration verifies server role rather than granting the forged role in storage', async () => {
  const { auth, persistence, local, session } = await authFixture();
  persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  local.setItem(AUTH_STORAGE_KEY, JSON.stringify({ version: 1, ownerId: 1, tokens, rememberMe: true, user: { ...user, role: 'ADMIN' } }));
  const pending = auth.hydrate();
  void pending.catch(() => {});
  expect(session.read().status).toBe('loading');
  await pending;
  expect(session.read().user?.role).toBe('USER');
});

it('expired persisted access refreshes once and verifies the replacement with the server', async () => {
  const { auth, persistence, session, calls } = await authFixture({ expired: true });
  persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: false });
  await auth.hydrate();
  expect(session.read().user).toEqual(user);
  expect(session.read().tokens?.accessToken).toBe('new-access');
  expect(calls.map(call => call.path)).toEqual(['/api/v1/auth/test-authorization', '/api/v1/auth/refresh', '/api/v1/auth/test-authorization']);
  expect(calls[1]?.authorization).toBe('Bearer refresh');
});

it('admin hydration verifies admin/me when the USER identity endpoint forbids it', async () => {
  const { auth, persistence, session, calls } = await authFixture({ role: 'ADMIN' });
  persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  await auth.hydrate();
  expect(session.read().user?.role).toBe('ADMIN');
  expect(calls.map(call => call.path)).toEqual(['/api/v1/auth/test-authorization', '/api/v1/admin/me']);
});

it('a login with unknown role must verify identity before establishing a session', async () => {
  const { auth, calls, session } = await authFixture({ role: null });
  await auth.login({ email: 'alice@example.test', password: 'valid' }, { rememberMe: false });
  expect(session.read().user?.role).toBe('USER');
  expect(calls.map(call => call.path)).toEqual(['/api/v1/auth/login', '/api/v1/auth/test-authorization']);
});

it('parallel refresh commands share one rotation and preserve the account revision', async () => {
  const { auth, session, persistence, calls } = await authFixture();
  session.establish(user, tokens); persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  const revision = session.read().revision;
  expect(await Promise.all([auth.refresh(revision), auth.refresh(revision)])).toEqual([true, true]);
  expect(calls.filter(call => call.path.endsWith('/refresh'))).toHaveLength(1);
  expect(session.read().revision).toBe(revision);
  expect(persistence.read()?.tokens.refreshToken).toBe('new-refresh');
});

it('refresh failure clears the local authenticated state and saved tokens without a loop', async () => {
  const { auth, session, persistence, calls } = await authFixture({ refreshFails: true });
  session.establish(user, tokens); persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  expect(await auth.refresh(session.read().revision)).toBe(false);
  expect(session.read().status).toBe('anonymous'); expect(persistence.read()).toBeNull();
  expect(calls.filter(call => call.path.endsWith('/refresh'))).toHaveLength(1);
});

it('logout clears local identity immediately but reports failed server revocation honestly', async () => {
  const { auth, session, persistence, calls } = await authFixture({ logoutFails: true });
  session.establish(user, tokens); persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  const pending = auth.logout();
  void pending.catch(() => {});
  expect(session.read().status).toBe('anonymous'); expect(persistence.read()).toBeNull();
  await expect(pending).rejects.toMatchObject({ status: 503, outcomeUnknown: true });
  expect(calls.filter(call => call.path.endsWith('/logout'))).toHaveLength(1);
});

it('corrupt persisted records cannot authenticate and do not erase other drafts', async () => {
  const { auth, local, session } = await authFixture();
  local.setItem(AUTH_STORAGE_KEY, '{'); local.setItem('assessment:owner:77', 'keep');
  await auth.hydrate();
  expect(session.read().status).toBe('anonymous'); expect(local.getItem('assessment:owner:77')).toBe('keep');
});

it.each(['https://evil.test', '//evil.test', '/\\evil.test', '/%2f%2fevil.test', '/login', '/admin', '/dashboard\n'])('a USER rejects external, login-loop or admin return path %s', returnTo => {
  expect(postLoginPath(user, returnTo)).toBe('/dashboard');
});

it('role-aware return navigation accepts registered internal pages only', () => {
  expect(postLoginPath(user, '/assessment?from=home#step')).toBe('/assessment?from=home#step');
  expect(postLoginPath({ ...user, role: 'ADMIN' }, null)).toBe('/admin');
  expect(postLoginPath({ ...user, role: 'ADMIN' }, '/admin/questions')).toBe('/admin/questions');
  expect(postLoginPath(user, '/unknown')).toBe('/dashboard');
});

it('a protected read can refresh once and use the new token without changing account scope', async () => {
  const received: string[] = [];
  const origin = await serve((request, response) => {
    received.push(request.headers.authorization ?? '');
    if (request.headers.authorization === 'Bearer old-access') response.writeHead(401);
    response.end('profile');
  });
  const session = createSessionStore(); session.establish(user, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: () => session.clear(), refresh: async () => {
    session.rotate({ accessToken: 'new-access', refreshToken: 'rotated' }, session.read().revision);
    return true;
  } });
  expect((await http.get('/profile')).data).toBe('profile');
  expect(received).toEqual(['Bearer old-access', 'Bearer new-access']);
});

it('explicit auth requests send the refresh token rather than the session access token', async () => {
  let received: string | undefined;
  const origin = await serve((request, response) => { received = request.headers.authorization; response.end('ok'); });
  const session = createSessionStore(); session.establish(user, tokens);
  const http = createHttpClient({ origin, session, credentials: 'explicit', onUnauthorized: () => {} });
  await http.post('/refresh', {}, { headers: { Authorization: 'Bearer refresh' } });
  expect(received).toBe('Bearer refresh');
});

it('expired mutations are never replayed and do not trigger an automatic refresh', async () => {
  let requests = 0, refreshes = 0;
  const origin = await serve((_request, response) => { requests++; response.writeHead(401); response.end(); });
  const session = createSessionStore(); session.establish(user, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: revision => { session.clear(revision); }, refresh: async () => { refreshes++; return true; } });
  await expect(http.post('/answers', { answer: true })).rejects.toMatchObject({ kind: 'http', status: 401 });
  expect(requests).toBe(1); expect(refreshes).toBe(0); expect(session.read().status).toBe('anonymous');
});

it('an unauthorized retried read stops after one refresh and clears its session', async () => {
  let requests = 0, refreshes = 0;
  const origin = await serve((_request, response) => { requests++; response.writeHead(401); response.end(); });
  const session = createSessionStore(); session.establish(user, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: revision => { session.clear(revision); }, refresh: async () => { refreshes++; return true; } });
  await expect(http.get('/profile')).rejects.toMatchObject({ kind: 'http', status: 401 });
  expect(requests).toBe(2); expect(refreshes).toBe(1); expect(session.read().status).toBe('anonymous');
});

it('duplicate login commands never create a second request and logout discards a late login result', async () => {
  const pending = deferred<Awaited<ReturnType<AuthApi['login']>>>();
  let requests = 0;
  const session = createSessionStore(), persistence = createAuthPersistence(memoryPort(), memoryPort());
  const auth = createAuthController({ session, persistence, api: {
    login: () => { requests++; return pending.promise; }, identity: async () => user,
    refresh: async () => tokens, logout: async () => {},
  } });
  const result = auth.login({ email: 'a@example.test', password: 'secret' }, { rememberMe: true });
  void result.catch(() => {});
  await expect(auth.login({ email: 'a@example.test', password: 'secret' }, { rememberMe: true })).rejects.toMatchObject({ kind: 'configuration' });
  expect(requests).toBe(1);
  await auth.logout(); pending.resolve({ user, tokens });
  await expect(result).rejects.toMatchObject({ kind: 'session-changed' });
  expect(session.read().status).toBe('anonymous'); expect(persistence.read()).toBeNull();
});

it('account switching discards old hydration and refresh results without changing the new owner', async () => {
  for (const command of ['hydrate', 'refresh'] as const) {
    const identity = deferred<typeof user>();
    const session = createSessionStore(), persistence = createAuthPersistence(memoryPort(), memoryPort());
    const bob = { ...user, id: 2, fullname: 'Bob' }, bobTokens = { accessToken: 'bob', refreshToken: 'bob-refresh' };
    const auth = createAuthController({ session, persistence, api: { login: async () => ({ user: bob, tokens: bobTokens }), identity: () => identity.promise, refresh: async () => ({ accessToken: 'rotated', refreshToken: 'rotated-refresh' }), logout: async () => {} } });
    persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
    if (command === 'refresh') session.establish(user, tokens);
    const pending = command === 'hydrate' ? auth.hydrate() : auth.refresh(session.read().revision);
    await Promise.resolve(); await auth.logout();
    await auth.login({ email: 'bob@example.test', password: 'secret' }, { rememberMe: true });
    identity.resolve(user); await pending;
    expect(session.read().user).toEqual(bob); expect(persistence.read()?.ownerId).toBe(2);
    expect(auth.notice()).toBeNull();
  }
});

it('unavailable browser persistence reports a failure and never creates a fake authenticated session', async () => {
  const session = createSessionStore();
  const auth = createAuthController({ session, persistence: { read: () => null, save: () => false, clear: () => true }, api: { login: async () => ({ user, tokens }), identity: async () => user, refresh: async () => tokens, logout: async () => {} } });
  await expect(auth.login({ email: 'a@example.test', password: 'secret' }, { rememberMe: true })).rejects.toMatchObject({ kind: 'configuration' });
  expect(session.read().status).toBe('anonymous');
});

it('token rotation keeps account caches while an account change clears them', () => {
  const session = createSessionStore(), runtime = createAppRuntime(session);
  session.establish(user, tokens); runtime.queryClient.setQueryData(['profile', 1], { fullname: 'Alice' });
  session.rotate({ accessToken: 'new', refreshToken: 'new' }, session.read().revision);
  expect(runtime.queryClient.getQueryData(['profile', 1])).toEqual({ fullname: 'Alice' });
  session.establish({ ...user, id: 2 }, tokens);
  expect(runtime.queryClient.getQueryData(['profile', 1])).toBeUndefined();
  runtime.dispose();
});

it('a stale unauthorized callback cannot change the new account or display its logout notice', async () => {
  const { auth, session } = await authFixture();
  session.establish(user, tokens); const oldRevision = session.read().revision;
  session.establish({ ...user, id: 2 }, tokens); auth.unauthorized(oldRevision);
  expect(session.read().user?.id).toBe(2); expect(auth.notice()).toBeNull();
});

it('refresh cannot re-save a session another tab removed while its request was pending', async () => {
  const pending = deferred<typeof tokens>();
  const session = createSessionStore(), persistence = createAuthPersistence(memoryPort(), memoryPort());
  session.establish(user, tokens); persistence.save({ version: 1, ownerId: 1, tokens, rememberMe: true });
  const auth = createAuthController({ session, persistence, api: { login: async () => ({ user, tokens }), identity: async () => user, refresh: () => pending.promise, logout: async () => {} } });
  const result = auth.refresh(session.read().revision);
  persistence.clear(); pending.resolve({ accessToken: 'new', refreshToken: 'new' });
  expect(await result).toBe(false); expect(persistence.read()).toBeNull();
  expect(session.read().status).toBe('anonymous');
});
