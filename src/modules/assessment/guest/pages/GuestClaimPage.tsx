import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useHttpClient } from '@/shared/api/api-context';
import { session, useSession } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { guestAssessmentStore } from '../model/guest-assessment';
import { claimGuestAssessment, lookupGuestClaim } from '../api/guest-assessment.api';
import styles from '../../testing/pages/HollandTestPage.module.css';

export function GuestClaimPage() {
  const current = useSession(), http = useHttpClient(), navigate = useNavigate(), queries = useQueryClient();
  const [params] = useSearchParams();
  const target = params.get('target') === 'roadmap' ? paths.roadmap : paths.advisor;
  const draft = useSyncExternalStore(guestAssessmentStore.subscribe, guestAssessmentStore.read);
  const id = draft?.result?.id, ownerId = current.user?.id, revision = current.revision;
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [reviewed, setReviewed] = useState(false);
  const request = useRef<AbortController | null>(null), pending = useRef(false);
  const wrongOwner = Boolean(draft?.claim && draft.claim.ownerId !== ownerId);
  useEffect(() => {
    let cancelled = false;
    // Defer dispatch until after StrictMode's setup/cleanup check. The durable
    // checkpoint is written before any POST; a remount never replays that POST.
    queueMicrotask(() => {
      const fresh = guestAssessmentStore.read();
      if (cancelled || !id || !ownerId || !fresh?.result || fresh.catalog.id !== id || fresh.claim || pending.current) return;
      const controller = new AbortController(); request.current = controller;
      const valid = () => !controller.signal.aborted && session.read().revision === revision && session.read().user?.id === ownerId;
      pending.current = true; setBusy(true); setMessage('');
      guestAssessmentStore.write({ ...fresh, claim: { ownerId, needsReview: true } });
      if (!guestAssessmentStore.available()) { setMessage('Chưa giữ được trạng thái lưu. Kiểm tra quyền lưu trữ và bài đã lưu trước khi tiếp tục.'); pending.current = false; setBusy(false); return; }
      void claimGuestAssessment(http, fresh.result.receipt, controller.signal).then(() => {
        if (!valid()) return;
        guestAssessmentStore.clear(id);
        void queries.invalidateQueries({ queryKey: ['assessment', 'history', ownerId, revision] });
        void queries.invalidateQueries({ queryKey: ['career-platform', ownerId, revision] });
        void navigate(target, { replace: true });
      }).catch(failure => {
        if (valid()) setMessage(failure instanceof ApiError && failure.status === 400 ? 'Bài đã hết hạn hoặc không còn hợp lệ để lưu. Kết quả tạm vẫn còn. Kiểm tra bài đã lưu hoặc chọn làm bài mới.' : 'Chưa xác nhận đã lưu bài. Kết quả tạm vẫn còn. Kiểm tra trước khi lưu lại.');
      }).finally(() => { pending.current = false; if (valid()) setBusy(false); });
    });
    return () => { cancelled = true; request.current?.abort(); };
  }, [http, id, navigate, ownerId, queries, revision, target]);

  const act = async (action: 'check' | 'retry') => {
    const fresh = guestAssessmentStore.read();
    if (!fresh?.result || !ownerId || pending.current || fresh.claim?.ownerId !== ownerId || (action === 'retry' && !reviewed)) return;
    const controller = new AbortController(); request.current = controller;
    const valid = () => !controller.signal.aborted && session.read().revision === revision && session.read().user?.id === ownerId;
    pending.current = true; setBusy(true); setMessage(''); setReviewed(false);
    try {
      if (action === 'retry') {
        guestAssessmentStore.write({ ...fresh, claim: { ownerId, needsReview: true } });
        if (!guestAssessmentStore.available()) throw new Error('storage');
        await claimGuestAssessment(http, fresh.result.receipt, controller.signal);
      } else await lookupGuestClaim(http, fresh.catalog.id, controller.signal);
      if (!valid()) return;
      guestAssessmentStore.clear(fresh.catalog.id);
      void queries.invalidateQueries({ queryKey: ['assessment', 'history', ownerId, revision] });
      void queries.invalidateQueries({ queryKey: ['career-platform', ownerId, revision] });
      void navigate(target, { replace: true });
    } catch (failure) {
      if (!valid()) return;
      if (action === 'check' && failure instanceof ApiError && failure.status === 404) { setReviewed(true); setMessage('Chưa thấy bài trong tài khoản. Yêu cầu trước có thể đang được xử lý. Kiểm tra lại trước khi chọn lưu lại.'); }
      else setMessage('Chưa xác nhận đã lưu bài. Kết quả tạm vẫn còn. Kiểm tra lại trước khi lưu.');
    } finally { pending.current = false; if (valid()) setBusy(false); }
  };
  return <CareerScreenFrame><div className={styles.page}>
    <h1>Lưu kết quả Holland</h1>
    {!draft?.result ? <><p>Không có bài Holland nào cần lưu trong tab này.</p><Link className="btn btn-primary" to={target}>Tiếp tục</Link><Link className="btn btn-secondary" to={paths.assessment}>Làm trắc nghiệm</Link></> : <>
      <p>Kết quả {draft.result.topCode} sẽ được lưu vào tài khoản {current.user?.fullname} trước khi tiếp tục.</p>
      {wrongOwner ? <p className={styles.notice} role="alert">Bài đang chờ xác nhận lưu ở tài khoản khác. Đăng nhập tài khoản đó để kiểm tra. Bài chưa được chuyển sang tài khoản này.</p> : busy ? <p role="status">Đang lưu kết quả…</p> : <p>Chưa xác nhận đã lưu bài. Kết quả tạm vẫn được giữ khi tải lại trang.</p>}
      {message && <p className={styles.notice} role="alert">{message}</p>}
      {!wrongOwner && <div className={styles.nav}><Button disabled={busy} variant="secondary" onClick={() => { void act('check'); }}>Kiểm tra bài đã lưu</Button><Button disabled={busy || !reviewed} onClick={() => { void act('retry'); }}>Thử lưu lại</Button></div>}
      <Link className="btn btn-secondary" to={paths.guestAssessmentResult}>Xem lại kết quả</Link>
    </>}
  </div></CareerScreenFrame>;
}
