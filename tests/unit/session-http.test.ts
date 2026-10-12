import { afterEach, expect, it } from 'vitest';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createSessionStore } from '@/shared/session/session';
import { createHttpClient } from '@/shared/api/http-client';
import { createRegistrationDraftStore } from '@/modules/auth/model/registration-draft';

const cleanup: Array<() => Promise<void>> = [];
afterEach(async () => { await Promise.all(cleanup.splice(0).map(close => close())); });

async function serve(handler: (req: IncomingMessage, res: ServerResponse) => void) {
  const server = createServer(handler);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No HTTP address');
  cleanup.push(() => new Promise<void>(resolve => { server.closeAllConnections(); server.close(() => resolve()); }));
  return `http://127.0.0.1:${address.port}`;
}

const alice = { id: 1, fullname: 'Alice', role: 'USER' as const };
const bob = { id: 2, fullname: 'Bob', role: 'USER' as const };
const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' };

it('anonymous invalid OTP 401 retains the registration draft without inventing an expired session', async () => {
  let requests = 0;
  const origin = await serve((_req, res) => { requests++; res.writeHead(401); res.end(); });
  const session = createSessionStore(), draft = createRegistrationDraftStore(session);
  draft.save({ email: 'student@example.test', fullname: 'Student', password: 'secret password', yob: '2008-02-29', phone: '0901234567' }, 0, true);
  const http = createHttpClient({ origin, session, onUnauthorized: revision => { session.clear(revision); } });
  await expect(http.post('/api/v1/auth/register', { otpCode: '123456' })).rejects.toMatchObject({ status: 401 });
  expect(draft.read()?.password).toBe('secret password');
  expect(session.read().revision).toBe(0);
  expect(requests).toBe(1);
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}

it('creates distinct scopes for sign-in and prevents an old logout from clearing the new account', () => {
  const session = createSessionStore();
  session.establish(alice, tokens);
  const first = session.read().revision;
  expect(session.read().user?.id).toBe(1);
  session.establish(bob, tokens);
  expect(session.read().revision).toBeGreaterThan(first);
  expect(session.clear(first)).toBe(false);
  expect(session.read().user?.id).toBe(2);
  expect(session.clear(session.read().revision)).toBe(true);
  expect(session.read().status).toBe('anonymous');
});

it('sends the current access token only to the configured API origin', async () => {
  const origin = await serve((req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ authorization: req.headers.authorization })); });
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  const response = await http.get('/profile');
  expect(response.data.authorization).toBe('Bearer test-access');
});

it('discards a successful old-account response after an account switch', async () => {
  const pending = deferred<ServerResponse>();
  const origin = await serve((_req, res) => pending.resolve(res));
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  const request = http.get('/profile');
  const response = await pending.promise;
  session.establish(bob, tokens);
  response.end('old account');
  await expect(request).rejects.toMatchObject({ kind: 'session-changed' });
});

it('current-account 401 invokes app-owned expiry without replaying the mutation', async () => {
  let requests = 0;
  const origin = await serve((_req, res) => { requests++; res.writeHead(401); res.end(); });
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: revision => { session.clear(revision); } });
  await expect(http.post('/submit', { answer: true })).rejects.toMatchObject({ kind: 'http', status: 401 });
  expect(session.read().status).toBe('anonymous');
  expect(requests).toBe(1);
});

it('a stale 401 cannot sign out the next account', async () => {
  const pending = deferred<ServerResponse>();
  const origin = await serve((_req, res) => pending.resolve(res));
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: revision => { session.clear(revision); } });
  const request = http.get('/profile');
  const response = await pending.promise;
  session.establish(bob, tokens);
  response.writeHead(401); response.end();
  await expect(request).rejects.toMatchObject({ kind: 'session-changed' });
  expect(session.read().user?.id).toBe(2);
});

it('a dropped mutation connection reports unknown outcome and never retries automatically', async () => {
  let requests = 0;
  const origin = await serve((req) => { requests++; req.socket.destroy(); });
  const session = createSessionStore();
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  await expect(http.post('/submit', { answer: true })).rejects.toMatchObject({ kind: 'network', outcomeUnknown: true });
  expect(requests).toBe(1);
});

it('propagates AbortSignal and distinguishes read cancellation from a server error', async () => {
  const pending = deferred<ServerResponse>();
  const origin = await serve((_req, res) => pending.resolve(res));
  const session = createSessionStore();
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  const controller = new AbortController();
  const request = http.get('/profile', { signal: controller.signal });
  await pending.promise;
  controller.abort();
  await expect(request).rejects.toMatchObject({ kind: 'cancelled', outcomeUnknown: false });
});

it('does not forward a bearer token to an absolute URL on a different origin', async () => {
  let leaked = 0;
  const foreign = await serve((_req, res) => { leaked++; res.end('received'); });
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin: 'http://127.0.0.1:1', session, onUnauthorized: () => {} });
  await expect(http.get(foreign + '/collect')).rejects.toMatchObject({ kind: 'configuration' });
  expect(leaked).toBe(0);
});

it('a same-tick account switch cannot attach the next account token to an existing mutation', async () => {
  const received = deferred<{ authorization: string | undefined; body: unknown }>();
  const origin = await serve((req, res) => {
    req.setEncoding('utf8');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      received.resolve({ authorization: req.headers.authorization, body: JSON.parse(body) as unknown });
      res.end('ok');
    });
  });
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  const result = http.post('/answers', { owner: 1 }).then(() => null, (error: unknown) => error);
  session.establish(bob, { accessToken: 'bob-access', refreshToken: 'bob-refresh' });
  expect(await received.promise).toEqual({ authorization: 'Bearer test-access', body: { owner: 1 } });
  expect(await result).toMatchObject({ kind: 'session-changed' });
});

it('rejects Axios baseURL/absolute-policy overrides that would resolve to a foreign origin', async () => {
  let leaked = 0;
  const origin = await serve((_req, res) => res.end('trusted'));
  const foreign = await serve((_req, res) => { leaked++; res.end('foreign'); });
  const session = createSessionStore();
  session.establish(alice, tokens);
  const http = createHttpClient({ origin, session, onUnauthorized: () => {} });
  await expect(http.get(origin + '/profile', { baseURL: foreign, allowAbsoluteUrls: false })).rejects.toMatchObject({ kind: 'configuration' });
  expect(leaked).toBe(0);
});
