import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router';
import { paths } from '@/routes/paths';
import { useHttpClient } from '@/shared/api/api-context';
import { ApiError } from '@/shared/api/api-error';
import { session } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { AsyncState } from '@/shared/ui/AsyncState';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import { HollandShowcase } from '../../testing/components/HollandShowcase';
import { useAssessmentQuestionsQuery } from '../../queries/assessment.queries';
import { guestAssessmentStore } from '../model/guest-assessment';
import type { GuestDraft } from '../model/guest-assessment';
import { readGuestCatalog, previewGuestAssessment } from '../api/guest-assessment.api';
import { useGuestExpiry } from '../model/useGuestExpiry';
import styles from '../../testing/pages/HollandTestPage.module.css';

export function GuestHollandPage() {
  const http = useHttpClient(), navigate = useNavigate();
  const questions = useAssessmentQuestionsQuery(true);
  const draft = useSyncExternalStore(guestAssessmentStore.subscribe, guestAssessmentStore.read);
  const expired = useGuestExpiry(draft?.catalog.expiresAt);
  const [overview, setOverview] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [discard, setDiscard] = useState(false);
  const request = useRef<AbortController | null>(null), pending = useRef(false), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => { request.current?.abort(); }, []);
  const focusKey = draft && !overview ? `${draft.catalog.id}:${draft.index}` : null;
  useEffect(() => { if (focusKey) heading.current?.focus({ preventScroll: true }); }, [focusKey]);
  const save = (next: GuestDraft) => { guestAssessmentStore.write(next); setError(''); };
  const start = async () => {
    if (pending.current) return;
    const controller = new AbortController(); request.current = controller; pending.current = true; setBusy(true); setError('');
    const revision = session.read().revision;
    try {
      const catalog = await readGuestCatalog(http, controller.signal);
      if (controller.signal.aborted || session.read().revision !== revision) return;
      save({ version: 1, catalog, answers: {}, index: 0, result: null, claim: null }); setOverview(false);
    } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof ApiError ? failure.message : 'Không bắt đầu được bài trắc nghiệm.'); }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false); }
  };
  const submit = async () => {
    if (!draft || pending.current) return;
    const controller = new AbortController(); request.current = controller; pending.current = true; setBusy(true); setError('');
    const revision = session.read().revision;
    try {
      const result = await previewGuestAssessment(http, draft, controller.signal);
      if (controller.signal.aborted || session.read().revision !== revision) return;
      save({ ...draft, result }); void navigate(paths.guestAssessmentResult);
    } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof ApiError ? failure.message : 'Chưa xem được kết quả. Đáp án vẫn được giữ.'); }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false); }
  };
  const question = draft?.catalog.questions[draft.index];
  const total = draft?.catalog.questions.length ?? questions.data?.length;
  const answered = Object.keys(draft?.answers ?? {}).length;
  const welcome = !draft || overview;
  return <CareerScreenFrame sidebar={<TimelineSidebar steps={[
    { id: 'start', title: 'START', description: 'Làm bài trước, đăng ký sau', status: welcome ? 'active' : 'completed' },
    { id: 'test', title: 'HOLLAND TEST', description: `${total ?? '…'} câu hỏi Có / Không`, status: welcome ? 'pending' : 'active' },
    { id: 'result', title: 'RIASEC', description: 'Xem tổng kết ngay sau bài làm', status: 'pending' },
    { id: 'account', title: 'TÀI KHOẢN', description: 'Lưu kết quả, tư vấn AI và lộ trình', status: 'pending' },
  ]} />}>
    <div className={`holland-page ${styles.page}`}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!guestAssessmentStore.available() && <p className={styles.notice} role="note">Chưa lưu được trên trình duyệt. Đáp án chỉ còn trong màn này; tải lại hoặc rời trang có thể mất bài.</p>}
      {guestAssessmentStore.invalid() && <p className={styles.notice}>Bản nháp trước không hợp lệ. Bạn có thể chủ động bắt đầu bài mới.</p>}
      {draft?.result ? <section className={styles.welcome}><h1>Bạn đã hoàn thành Holland</h1><p>Kết quả đang được giữ trong phiên trình duyệt này.</p><Link className="btn btn-primary" to={paths.guestAssessmentResult}>Xem tổng kết RIASEC</Link><Button variant="secondary" onClick={() => setDiscard(true)}>Làm bài mới</Button></section> : welcome ? <section className={styles.welcome}>
        <h1>Trắc nghiệm Holland RIASEC</h1><p className={styles.description}>Khám phá sở thích nghề nghiệp và xem tổng kết RIASEC ngay. Bạn có thể đăng ký sau để lưu kết quả, trao đổi với AI và xây dựng lộ trình.</p>
        <div className={styles.stats}><div><strong>{total ?? '…'} câu hỏi</strong><span>BỘ ĐỀ HIỆN TẠI</span></div><div><strong>Có / Không</strong><span>THEO CẢM NHẬN CỦA BẠN</span></div><div><strong>Không cần tài khoản</strong><span>LÀM BÀI VÀ XEM RIASEC</span></div></div>
        {questions.isError && !draft ? <AsyncState state="error" title="Không tải được bộ câu hỏi." action={<Button onClick={() => { void questions.refetch(); }}>Thử lại câu hỏi</Button>} /> : questions.isPending && !draft ? <AsyncState state="loading" title="Đang tải bộ câu hỏi…" /> : !total ? <p>Bộ đề chưa có câu hỏi.</p> : <Button className={styles.start} aria-label={draft ? 'Tiếp tục bài đang làm' : 'Bắt đầu bài trắc nghiệm'} disabled={busy} onClick={() => { if (draft) setOverview(false); else void start(); }}>{busy ? 'Đang bắt đầu…' : draft ? `Tiếp tục bài đang làm (${answered}/${total} câu)` : `Bắt đầu làm bài trắc nghiệm (${total} câu) →`}</Button>}
        <HollandShowcase /><p className={styles.help}>Tiến độ được giữ trong tab này khi tải lại trang. Đóng tab có thể mất bài chưa lưu. Phiên làm bài có hiệu lực 24 giờ.</p>
      </section> : draft && question && <>
        <div className={styles.utility}><button className={styles.back} disabled={busy} onClick={() => setOverview(true)}>← Quay lại giới thiệu</button><span role="status">{guestAssessmentStore.available() ? 'Đã lưu trong phiên trình duyệt' : 'Chưa lưu trên thiết bị'}</span></div>
        {expired && <p className={styles.notice}>Phiên làm bài đã hết hạn. Đáp án vẫn được giữ để xem lại. <Button onClick={() => setDiscard(true)}>Bắt đầu bài mới</Button></p>}
        <div className={styles.questionMeta}><span className={styles.pill}>Nhóm {question.type}</span><span>Câu {draft.index + 1}/{total}</span></div>
        <div className={styles.progress} role="progressbar" aria-label="Số câu đã trả lời" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><span style={{ width: `${answered / total! * 100}%` }} /></div>
        <section className={styles.question}><h1 ref={heading} tabIndex={-1}>{question.content}</h1><fieldset className={styles.answers} disabled={busy}><legend>Hoạt động này có phù hợp với sở thích của bạn không?</legend><div className={styles.choices}>{[{ check: true, label: 'Có — Tôi thích' }, { check: false, label: 'Không — Tôi không thích' }].map(option => <label key={option.label} className={`holland-choice ${styles.choice} ${draft.answers[String(question.id)] === option.check ? styles.selected : ''}`}><input type="radio" name="guest-answer" aria-label={option.label} checked={draft.answers[String(question.id)] === option.check} onChange={() => save({ ...draft, answers: { ...draft.answers, [String(question.id)]: option.check } })} /><span className={styles.choiceIcon} aria-hidden="true">{option.check ? '✓' : '−'}</span><strong>{option.label}</strong></label>)}</div></fieldset></section>
        <nav className={styles.nav} aria-label="Chuyển câu hỏi"><Button variant="secondary" disabled={busy || draft.index === 0} onClick={() => save({ ...draft, index: draft.index - 1 })}>Câu trước đó</Button>{draft.index < total! - 1 ? <Button disabled={busy || typeof draft.answers[String(question.id)] !== 'boolean'} onClick={() => save({ ...draft, index: draft.index + 1 })}>Tiếp theo</Button> : <Button disabled={busy || typeof draft.answers[String(question.id)] !== 'boolean'} onClick={() => { void submit(); }}>{busy ? 'Đang tổng kết…' : 'Xem tổng kết RIASEC'}</Button>}</nav>
      </>}
      {discard && <section className={styles.notice} aria-label="Xác nhận làm bài mới"><p>Bắt đầu bài mới sẽ thay bài và kết quả tạm trong tab này.</p><Button variant="secondary" onClick={() => setDiscard(false)}>Giữ bài hiện tại</Button><Button disabled={busy} onClick={() => { setDiscard(false); void start(); }}>Xác nhận làm bài mới</Button></section>}
    </div>
  </CareerScreenFrame>;
}
