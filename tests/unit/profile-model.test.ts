import { expect, it } from 'vitest';
import axios from 'axios';
import { createSessionStore } from '@/shared/session/session';
import { profileSchema, profileToForm, toProfilePatch } from '@/modules/profile/model/profile.schema';
import { createProfileDraftStore } from '@/modules/profile/model/profile-draft';
import { updateProfile } from '@/modules/profile/api/profile.api';

const fields = { fullname: ' Student ', phone: ' 0901234567 ', address: ' ', gender: '' as const, class: '' };
const profile = { fullname: 'Student', phone: null, address: null, gender: null, class: null, email: 'student@example.test' };

it('profile payload trims allowed fields, preserves optional null and drops privileged/career fields', () => {
  expect(toProfilePatch({ ...fields, id: 99, role: 'ADMIN', email: 'other@example.test', skills: ['fake'] } as typeof fields)).toEqual({ fullname: 'Student', phone: '0901234567', address: null, gender: null, class: null });
  expect(profileToForm(profile)).toEqual({ fullname: 'Student', phone: '', address: '', gender: '', class: '' });
});
it('profile schema enforces backend bounds, phone, gender and grade without decimal/coercion', () => {
  for (const invalid of [{ fullname: '' }, { fullname: 'x'.repeat(121) }, { phone: '+84901234567' }, { phone: '090 1234567' }, { address: 'x'.repeat(501) }, { class: '0' }, { class: '13' }, { class: '1.5' }, { gender: 'NAM' }]) {
    expect(profileSchema.safeParse({ ...fields, ...invalid }).success).toBe(false);
  }
  expect(toProfilePatch({ ...fields, fullname: 'x'.repeat(120), address: 'x'.repeat(500), class: '1' }).class).toBe(1);
  expect(toProfilePatch({ ...fields, class: '12', gender: 'OTHER' }).gender).toBe('OTHER');
});
it('draft keeps defensive copies and preserves uncertain outcome through further typing', () => {
  const session = createSessionStore(); session.establish({ id: 1, fullname: 'A', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
  const scope = { ownerId: 1, revision: session.read().revision }, store = createProfileDraftStore(session);
  store.save(fields, scope, true); const copy = store.read(scope)!; copy.fields.fullname = 'tampered'; copy.scope.ownerId = 99;
  store.save({ ...fields, fullname: 'Further edits' }, scope);
  expect(store.read(scope)).toMatchObject({ version: 1, fields: { fullname: 'Further edits' }, needsReview: true }); store.dispose();
});
it('account changes clear drafts and reject stale writes or clears from an earlier session', () => {
  const session = createSessionStore(); session.establish({ id: 1, fullname: 'A', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
  const old = { ownerId: 1, revision: session.read().revision }, store = createProfileDraftStore(session); store.save(fields, old);
  session.establish({ id: 2, fullname: 'B', role: 'USER' }, { accessToken: 'b', refreshToken: 'rb' });
  const next = { ownerId: 2, revision: session.read().revision };
  expect(store.read(old)).toBeNull(); expect(store.save(fields, old)).toBe(false);
  store.save({ ...fields, fullname: 'B draft' }, next); store.clear(old); expect(store.read(next)?.fields.fullname).toBe('B draft');
  session.clear(); expect(store.read(next)).toBeNull(); store.dispose();
});
it('same-account token rotation retains draft while a fresh memory store starts empty', () => {
  const session = createSessionStore(); session.establish({ id: 1, fullname: 'A', role: 'USER' }, { accessToken: 'a', refreshToken: 'r' });
  const scope = { ownerId: 1, revision: session.read().revision }, store = createProfileDraftStore(session); store.save(fields, scope);
  session.rotate({ accessToken: 'rotated', refreshToken: 'rr' }, scope.revision); expect(store.read(scope)?.fields.fullname).toBe(fields.fullname);
  const fresh = createProfileDraftStore(session); expect(fresh.read(scope)).toBeNull(); store.dispose(); fresh.dispose();
});
it('malformed PATCH success is an unknown outcome and the API explicitly allowlists body fields', async () => {
  let body: unknown;
  const http = axios.create({ adapter: async config => { body = JSON.parse(config.data as string); return { status: 200, statusText: 'OK', headers: {}, config, data: { status: 200, data: { saved: true } } }; } });
  await expect(updateProfile(http, { ...toProfilePatch(fields), id: 2, skills: ['fake'] } as ReturnType<typeof toProfilePatch>, new AbortController().signal)).rejects.toMatchObject({ outcomeUnknown: true });
  expect(body).toEqual({ fullname: 'Student', phone: '0901234567', address: null, gender: null, class: null });
});
