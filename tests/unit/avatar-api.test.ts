import { expect, it } from 'vitest';
import axios from 'axios';
import { ApiError } from '@/shared/api/api-error';
import { avatarFileError, MAX_AVATAR_BYTES, readAvatar, uploadAvatar } from '@/modules/profile/api/avatar.api';

it('validates avatar type, nonempty content and size before a request', () => {
  expect(avatarFileError(new File(['image'], 'avatar.png', { type: 'image/png' }))).toBeNull();
  for (const file of [new File(['svg'], 'avatar.svg', { type: 'image/svg+xml' }), new File([], 'empty.png', { type: 'image/png' }), new File([new Uint8Array(MAX_AVATAR_BYTES + 1)], 'large.png', { type: 'image/png' })]) {
    expect(avatarFileError(file)).not.toBeNull();
  }
});
it('sends a single multipart avatar without an owner or manual Content-Type', async () => {
  const file = new File(['png'], 'avatar.png', { type: 'image/png' });
  let calls = 0;
  const http = axios.create({ adapter: async config => {
    calls++;
    expect(config.method).toBe('put');
    expect(config.url).toBe('/api/v1/users/me/avatar');
    expect(config.data).toBeInstanceOf(FormData);
    expect((config.data as FormData).get('avatar')).toBeInstanceOf(File);
    expect((config.data as FormData).get('userId')).toBeNull();
    return { status: 200, statusText: 'OK', headers: {}, config, data: { status: 200, data: { saved: true } } };
  } });
  await uploadAvatar(http, file, new AbortController().signal);
  expect(calls).toBe(1);
});
it('treats malformed save acknowledgement as unknown and missing avatar as normal absence', async () => {
  const http = axios.create({ adapter: async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: { status: 200 } }) });
  await expect(uploadAvatar(http, new File(['png'], 'avatar.png', { type: 'image/png' }), new AbortController().signal)).rejects.toMatchObject({ outcomeUnknown: true });
  const missing = axios.create({ adapter: async () => { throw new ApiError('http', 'Missing', 404); } });
  expect(await readAvatar(missing, new AbortController().signal)).toBeNull();
  const malformed = axios.create({ adapter: async config => ({ status: 200, statusText: 'OK', headers: {}, config, data: new Blob(['json'], { type: 'application/json' }) }) });
  await expect(readAvatar(malformed, new AbortController().signal)).rejects.toBeInstanceOf(ApiError);
});
