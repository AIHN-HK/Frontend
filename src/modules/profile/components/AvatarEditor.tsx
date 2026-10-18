import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';
import { ApiError } from '@/shared/api/api-error';
import { session } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { paths } from '@/routes/paths';
import { avatarFileError } from '../api/avatar.api';
import { useAvatarMutation, useAvatarQuery } from '../queries/avatar.queries';
import type { ProfileScope } from '../model/profile.types';

function AvatarImage({ image, alt }: { image: Blob; alt: string }) {
  const node = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const element = node.current;
    if (!element) return;
    const url = URL.createObjectURL(image); element.src = url;
    return () => { element.removeAttribute('src'); URL.revokeObjectURL(url); };
  }, [image]);
  return <img ref={node} alt={alt} width="96" height="96" className="profile-avatar-image" />;
}

export function AvatarEditor({ scope }: { scope: ProfileScope }) {
  const query = useAvatarQuery(), mutation = useAvatarMutation(), navigation = useNavigation();
  const [file, setFile] = useState<File | null>(null), [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false), [needsReview, setNeedsReview] = useState(false), [reviewed, setReviewed] = useState(false);
  const request = useRef<AbortController | null>(null), active = useRef(false), pending = useRef(false), input = useRef<HTMLInputElement>(null);
  const leaving = navigation.state !== 'idle' && navigation.location.pathname !== paths.careerProfile;
  useEffect(() => { active.current = true; return () => { active.current = false; request.current?.abort(); }; }, []);
  useEffect(() => { if (leaving) request.current?.abort(); }, [leaving]);
  const owned = () => active.current && session.read().user?.id === scope.ownerId && session.read().revision === scope.revision;
  const save = async () => {
    if (!file || pending.current || needsReview || !query.isSuccess || leaving) return;
    pending.current = true; setError(null); setSuccess(false);
    const controller = new AbortController(); request.current = controller;
    try {
      await mutation.mutateAsync({ file, scope, signal: controller.signal });
      if (!owned() || controller.signal.aborted) return;
      setFile(null); if (input.current) input.current.value = ''; setSuccess(true);
    } catch (failure) {
      if (!owned() || controller.signal.aborted) return;
      const unknown = failure instanceof ApiError && failure.outcomeUnknown;
      setNeedsReview(unknown); setReviewed(false);
      setError(unknown ? 'Chưa xác nhận ảnh đã được lưu. Ảnh đã chọn được giữ lại; hãy kiểm tra ảnh đã lưu trước khi thử lại.' : 'Không thể lưu ảnh. Ảnh đã chọn được giữ lại; kiểm tra định dạng và thử lại.');
    } finally { pending.current = false; if (request.current === controller) request.current = null; }
  };
  const busy = mutation.isPending || leaving;
  return <section className="career-profile-card profile-avatar-card" aria-label="Ảnh đại diện">
    <header className="career-profile-card-header"><h2>Ảnh đại diện</h2><span>Chỉ lưu khi bạn chọn lưu ảnh</span></header>
    <div className="career-profile-card-body">
      <div className="profile-avatar-previews">
        <div>{query.data ? <AvatarImage image={query.data} alt="Ảnh đại diện đã lưu" /> : <span className="profile-avatar-empty" aria-hidden="true">AI</span>}<p>{query.isPending ? 'Đang tải ảnh…' : query.isError ? 'Chưa tải được ảnh đã lưu.' : query.data ? 'Ảnh đã lưu' : 'Chưa có ảnh đại diện'}</p></div>
        {file && <div><AvatarImage image={file} alt="Xem trước ảnh đại diện" /><p>Ảnh mới chưa lưu</p></div>}
      </div>
      <div className="field"><label htmlFor="profile-avatar-file">Chọn ảnh đại diện</label><input ref={input} id="profile-avatar-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} aria-describedby="profile-avatar-help" onChange={event => {
        const selected = event.currentTarget.files?.[0]; if (!selected) return;
        const invalid = avatarFileError(selected); setSuccess(false);
        if (invalid) { setError(invalid); event.currentTarget.value = ''; return; }
        setFile(selected); if (!needsReview) setError(null);
      }} /><p id="profile-avatar-help">JPG, PNG hoặc WebP tĩnh, tối đa 5 MB. Ảnh được căn giữa thành hình vuông.</p></div>
      {error && <p className="career-profile-error" role="alert">{error}</p>}
      {success && <p className="career-profile-success" role="status">Đã lưu ảnh đại diện.</p>}
      {query.isError && <p role="alert">Không tải được ảnh đại diện. Hãy thử tải lại trước khi lưu ảnh mới.</p>}
      <div className="career-profile-actions">
        <Button disabled={busy || query.isFetching} variant="secondary" onClick={async () => {
          const result = await query.refetch();
          if (owned()) setReviewed(result.isSuccess);
        }}>{query.isFetching ? 'Đang tải ảnh…' : 'Kiểm tra ảnh đã lưu'}</Button>
        {needsReview && reviewed && <Button variant="secondary" disabled={busy} onClick={() => { setNeedsReview(false); setError(null); }}>Đã kiểm tra, cho phép lưu lại</Button>}
        {file && <Button variant="secondary" disabled={busy} onClick={() => { setFile(null); if (input.current) input.current.value = ''; setSuccess(false); }}>Bỏ ảnh đã chọn</Button>}
        <Button disabled={!file || busy || needsReview || !query.isSuccess || query.isFetching} onClick={() => { void save(); }}>{mutation.isPending ? 'Đang lưu ảnh…' : 'Lưu ảnh đại diện'}</Button>
      </div>
    </div>
  </section>;
}
