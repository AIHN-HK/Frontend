import { expect, it } from 'vitest';
import { createAppRuntime } from '@/app/bootstrap';
import { createSessionStore } from '@/shared/session/session';
import { createBrowserStorage } from '@/shared/storage/browser-storage';
import { readEnvironment } from '@/shared/config/env';
import { ApiError } from '@/shared/api/api-error';

it('account switch clears old server records and cancels the old query signal', async () => {
  const session = createSessionStore();
  const runtime = createAppRuntime(session);
  session.establish({ id: 1, fullname: 'Alice', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
  runtime.queryClient.setQueryData(['profile', 1], { fullname: 'Alice' });
  let signal: AbortSignal | undefined;
  const pending = runtime.queryClient.fetchQuery({ queryKey: ['pending', 1], queryFn: context => {
    signal = context.signal;
    return new Promise(() => {});
  } });
  void pending.catch(() => {});
  session.establish({ id: 2, fullname: 'Bob', role: 'USER' }, { accessToken: 'b', refreshToken: 's' });
  expect(signal?.aborted).toBe(true);
  expect(runtime.queryClient.getQueryData(['profile', 1])).toBeUndefined();
  runtime.dispose();
});

it('retries a transient read once and stops retrying auth or obsolete-session errors', async () => {
  const runtime = createAppRuntime();
  let attempts = 0;
  await expect(runtime.queryClient.fetchQuery({ queryKey: ['transient'], queryFn: () => {
    attempts++;
    throw new ApiError('network', 'offline');
  }, retryDelay: 0 })).rejects.toMatchObject({ kind: 'network' });
  expect(attempts).toBe(2);
  for (const error of [new ApiError('http', 'unauthorized', 401), new ApiError('session-changed', 'changed')]) {
    let reads = 0;
    await expect(runtime.queryClient.fetchQuery({ queryKey: [error.kind], queryFn: () => {
      reads++;
      throw error;
    }, retryDelay: 0 })).rejects.toBe(error);
    expect(reads).toBe(1);
  }
  runtime.dispose();
});

it('malformed/unavailable browser storage returns a recoverable result without erasing another draft', () => {
  const values = new Map([['bad', '{'], ['other-draft', '"keep"']]);
  const storage = createBrowserStorage({
    getItem: key => values.get(key) ?? null,
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('denied'); },
  });
  const isString = (value: unknown): value is string => typeof value === 'string';
  expect(storage.read('bad', isString)).toBeNull();
  expect(storage.write('draft', { answer: true })).toBe(false);
  expect(storage.remove('bad')).toBe(false);
  expect(storage.read('other-draft', isString)).toBe('keep');
});

it.each(['ftp://example.test', 'http://user:password@example.test', 'https://example.test/api', 'https://example.test/?secret=1'])('rejects invalid public origin %s', value => {
  expect(() => readEnvironment({ VITE_API_ORIGIN: value })).toThrow();
});

it('normalizes a valid API/socket origin without appending an endpoint prefix', () => {
  expect(readEnvironment({ VITE_API_ORIGIN: 'https://api.example.test/', VITE_SOCKET_ORIGIN: 'http://localhost:3000/' })).toEqual({
    apiOrigin: 'https://api.example.test', socketOrigin: 'http://localhost:3000',
  });
});
