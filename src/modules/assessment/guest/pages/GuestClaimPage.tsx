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
      if (!guestAssessmentStore.available()) { setMessage('Chưa giữ được trạng thái lưu trong trình duyệt. Hãy kiểm tra quyền lưu trữ rồi kiểm tra bài đã lưu trước khi thử tiếp.'); pending.current = false; setBusy(false); return; }
      void claimGuestAssessment(http, fresh.result.receipt, controller.signal).then(() => {
        if (!valid()) return;
        guestAssessmentStore.clear(id);
        void queries.invalidateQueries({ queryKey: ['assessment', 'history', ownerId, revision] });
        void queries.invalidateQueries({ queryKey: ['career-platform', ownerId, revision] });
        void navigate(target, { replace: true });
      }).catch(failure => {
        if (valid()) setMessage(failure instanceof ApiError && failure.status === 400 ? 'Phiên làm bài đã hết hạn hoặc không còn hợp lệ để lưu. Kết quả tạm vẫn được giữ; hãy kiểm tra bài đã lưu hoặc chủ động làm bài mới.' : 'Chưa xác nhận bài đã lưu. Kết quả tạm được giữ; hãy kiểm tra trước khi thử lưu lại.');
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
      if (action === 'check' && failure instanceof ApiError && failure.status === 404) { setReviewed(true); setMessage('Chưa thấy bài đã lưu trong tài khoản này. Yêu cầu trước có thể còn xử lý; bạn có thể kiểm tra lại hoặc chủ động thử lưu lại.'); }
      else setMessage('Chưa xác nhận bài đã lưu. Kết quả tạm vẫn được giữ; hãy kiểm tra lại trước khi thử lưu.');
    } finally { pending.current = false; if (valid()) setBusy(false); }
  };
  return <CareerScreenFrame><div className={styles.page}>
    <h1>Lưu kết quả Holland vào tài khoản</h1>
    {!draft?.result ? <><p>Không có bài Holland chưa lưu trong phiên này.</p><Link className="btn btn-primary" to={target}>Tiếp tục tới tính năng đã chọn</Link><Link className="btn btn-secondary" to={paths.assessment}>Làm bài Holland</Link></> : <>
      <p>Kết quả {draft.result.topCode} sẽ được lưu vào tài khoản {current.user?.fullname} trước khi tiếp tục.</p>
      {wrongOwner ? <p className={styles.notice} role="alert">Bài này đang chờ xác nhận lưu với tài khoản khác. Hãy đăng nhập lại đúng tài khoản đó để kiểm tra; bài sẽ không tự chuyển sang tài khoản hiện tại.</p> : busy ? <p role="status">Đang xác nhận và lưu bài…</p> : <p>Bài đang chờ xác nhận lưu. Tải lại trang sẽ giữ kết quả tạm để bạn kiểm tra tiếp.</p>}
      {message && <p className={styles.notice} role="alert">{message}</p>}
      {!wrongOwner && <div className={styles.nav}><Button disabled={busy} variant="secondary" onClick={() => { void act('check'); }}>Kiểm tra bài đã lưu</Button><Button disabled={busy || !reviewed} onClick={() => { void act('retry'); }}>Thử lưu lại</Button></div>}
      <Link className="btn btn-secondary" to={paths.guestAssessmentResult}>Xem lại tổng kết RIASEC</Link>
    </>}
  </div></CareerScreenFrame>;
}
