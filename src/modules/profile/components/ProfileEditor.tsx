import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseQueryResult } from '@tanstack/react-query';
import { paths } from '@/routes/paths';
import { session } from '@/shared/session/session';
import { ApiError } from '@/shared/api/api-error';
import { Field } from '@/shared/ui/Field';
import { Button } from '@/shared/ui/Button';
import { useProfileMutation } from '../queries/profile.queries';
import { profileDraft } from '../model/profile-draft';
import { profileSchema, profileToForm, toProfilePatch } from '../model/profile.schema';
import type { ProfileForm } from '../model/profile.schema';
import type { Profile, ProfileScope } from '../model/profile.types';

const genderLabels = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

export function ProfileEditor({ profile, scope, query }: { profile: Profile; scope: ProfileScope; query: UseQueryResult<Profile> }) {
  const draft = profileDraft.read(scope);
  const mutation = useProfileMutation(), navigation = useNavigation();
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.careerProfile;
  const active = useRef(false), pending = useRef(false), request = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(() => draft?.needsReview ? 'Yêu cầu lưu trước chưa được xác nhận. Kiểm tra dữ liệu đã lưu trước khi gửi lại.' : null);
  const [success, setSuccess] = useState(false), [review, setReview] = useState<Profile | null>(null), [checking, setChecking] = useState(false);
  const { register, getValues, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema), defaultValues: draft?.fields ?? profileToForm(profile),
  });
  const busy = isSubmitting || mutation.isPending;
  const currentScope = () => active.current && session.read().user?.id === scope.ownerId && session.read().revision === scope.revision;
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; request.current?.abort(); };
  }, []);
  useEffect(() => { if (leaving) request.current?.abort(); }, [leaving]);

  const save = async (fields: ProfileForm) => {
    const controller = new AbortController(); request.current = controller;
    profileDraft.save(getValues(), scope, true);
    setError(null); setSuccess(false); setReview(null);
    try {
      const saved = await mutation.mutateAsync({ input: toProfilePatch(fields), scope, signal: controller.signal });
      if (!currentScope() || controller.signal.aborted) return;
      reset(profileToForm(saved)); profileDraft.clear(scope); setSuccess(true);
    } catch (failure) {
      if (!currentScope() || controller.signal.aborted) return;
      const unknown = failure instanceof ApiError && failure.outcomeUnknown;
      profileDraft.save(getValues(), scope, unknown);
      setError(unknown ? 'Chưa xác nhận hồ sơ đã được lưu. Bản nháp được giữ lại; hãy kiểm tra dữ liệu đã lưu trước khi thử lại.' : 'Không thể lưu hồ sơ. Kiểm tra thông tin và thử lại; bản nháp được giữ nguyên.');
    } finally { pending.current = false; if (request.current === controller) request.current = null; }
  };

  const checkSaved = async () => {
    if (pending.current || checking || leaving) return;
    setChecking(true); setSuccess(false);
    const result = await query.refetch();
    if (!currentScope()) return;
    setChecking(false);
    if (result.isSuccess) setReview(result.data);
    else { setReview(null); setError('Không tải được dữ liệu đã lưu. Bản nháp được giữ nguyên; hãy thử kiểm tra lại.'); }
  };

  return <>
    <form className="career-profile-card" noValidate aria-busy={busy} onChange={() => { profileDraft.save(getValues(), scope); setSuccess(false); }} onSubmit={event => {
      if (pending.current || checking || leaving) { event.preventDefault(); return; }
      pending.current = true; profileDraft.save(getValues(), scope);
      void handleSubmit(save, () => { pending.current = false; setSuccess(false); })(event);
    }}>
      <header className="career-profile-card-header"><h2>1. Thông tin cá nhân &amp; Học vấn</h2><span>{busy ? 'Đang lưu' : isDirty || draft ? 'Có bản nháp chưa lưu' : 'Thông tin đã tải'}</span></header>
      <div className="career-profile-card-body">
        <dl className="career-profile-metadata"><div><dt>Email tài khoản</dt><dd>{profile.email}</dd></div>{profile.age !== undefined && <div><dt>Tuổi</dt><dd>{profile.age}</dd></div>}</dl>
        <fieldset disabled={busy || checking || leaving} className="career-profile-fields"><legend className="career-profile-legend">Thông tin có thể chỉnh sửa</legend>
          <Field id="profile-fullname" label="Họ và tên" autoComplete="name" {...register('fullname')} error={errors.fullname?.message} />
          <Field id="profile-phone" label="Số điện thoại" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} error={errors.phone?.message} />
          <div className="field career-profile-wide"><label htmlFor="profile-address">Địa chỉ</label><textarea id="profile-address" rows={3} autoComplete="street-address" aria-invalid={!!errors.address} aria-describedby={errors.address ? 'profile-address-error' : undefined} {...register('address')} />{errors.address && <span className="field-error" id="profile-address-error">{errors.address.message}</span>}</div>
          <div className="field"><label htmlFor="profile-gender">Giới tính</label><select id="profile-gender" aria-invalid={!!errors.gender} aria-describedby={errors.gender ? 'profile-gender-error' : undefined} {...register('gender')}><option value="">Chưa chọn</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option><option value="OTHER">Khác</option></select>{errors.gender && <span className="field-error" id="profile-gender-error">{errors.gender.message}</span>}</div>
          <div className="field"><label htmlFor="profile-class">Lớp hiện tại</label><select id="profile-class" aria-invalid={!!errors.class} aria-describedby={errors.class ? 'profile-class-error' : undefined} {...register('class')}><option value="">Chưa chọn</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={String(index + 1)}>Lớp {index + 1}</option>)}</select>{errors.class && <span className="field-error" id="profile-class-error">{errors.class.message}</span>}</div>
        </fieldset>
        <p className="career-profile-unavailable">Trường THPT, tổ hợp môn và nguyện vọng đại học chưa sẵn sàng.</p>
        {error && <p className="career-profile-error" role="alert">{error}</p>}
        {success && <p className="career-profile-success" role="status">Đã lưu cập nhật hồ sơ.</p>}
        {query.isError && <p className="career-profile-error">Chưa tải lại được hồ sơ đã lưu. Bản nháp vẫn được giữ.</p>}
        {review && <section className="career-profile-review" aria-label="Dữ liệu đã lưu trên máy chủ"><h3>Dữ liệu đã lưu trên máy chủ</h3><p>Đối chiếu với bản nháp của bạn trước khi lưu lại.</p><dl>
          <div><dt>Họ và tên</dt><dd>{review.fullname || 'Chưa có'}</dd></div><div><dt>Điện thoại</dt><dd>{review.phone || 'Chưa có'}</dd></div><div><dt>Địa chỉ</dt><dd>{review.address || 'Chưa có'}</dd></div><div><dt>Giới tính</dt><dd>{review.gender === null ? 'Chưa chọn' : genderLabels[review.gender]}</dd></div><div><dt>Lớp</dt><dd>{review.class ?? 'Chưa chọn'}</dd></div>
        </dl><Button type="button" variant="secondary" disabled={busy || checking || leaving} onClick={() => { reset(profileToForm(review)); profileDraft.clear(scope); setError(null); setSuccess(false); setReview(null); }}>Thay bản nháp bằng dữ liệu đã lưu</Button></section>}
      </div>
      <footer className="career-profile-card-footer"><p>Chỉ lưu khi bạn chọn “Lưu cập nhật”.</p><div className="career-profile-actions"><Button type="button" variant="secondary" disabled={busy || checking || leaving} onClick={() => { void checkSaved(); }}>{checking ? 'Đang kiểm tra…' : 'Kiểm tra dữ liệu đã lưu'}</Button><Button type="submit" disabled={busy || checking || leaving}>{busy ? 'Đang lưu…' : 'Lưu cập nhật'}</Button></div></footer>
    </form>
  </>;
}
