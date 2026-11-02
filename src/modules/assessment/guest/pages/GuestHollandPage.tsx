import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router';
import { paths } from '@/routes/paths';
import { useHttpClient } from '@/shared/api/api-context';
import { ApiError } from '@/shared/api/api-error';
import { session } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { AsyncState } from '@/shared/ui/AsyncState';
import { SpotlightCard } from '@/shared/ui/SpotlightCard';
import { HollandWorkspace } from '../../testing/components/HollandWorkspace';
import { HollandProgress } from '../../testing/components/HollandProgress';
import { HollandKeyboard } from '../../testing/components/HollandKeyboard';
import { QuestionTransition } from '../../testing/components/QuestionTransition';
import { AssessmentProcessing } from '../../testing/components/AssessmentProcessing';
import { HollandShowcase } from '../../testing/components/HollandShowcase';
import { LiveRiasecSummary } from '../../testing/components/LiveRiasecSummary';
import { useAssessmentQuestionsQuery } from '../../queries/assessment.queries';
import { guestAssessmentStore } from '../model/guest-assessment';
import type { GuestDraft } from '../model/guest-assessment';
import { readGuestCatalog, previewGuestAssessment } from '../api/guest-assessment.api';
import { useGuestExpiry } from '../model/useGuestExpiry';
import styles from '../../testing/pages/HollandTestPage.module.css';
import fade from './FadeContent.module.css';

export function GuestHollandPage() {
  const http = useHttpClient(), navigate = useNavigate();
  const questions = useAssessmentQuestionsQuery(true);
  const draft = useSyncExternalStore(guestAssessmentStore.subscribe, guestAssessmentStore.read);
  const expired = useGuestExpiry(draft?.catalog.expiresAt);
  const [overview, setOverview] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [discard, setDiscard] = useState(false);
  const request = useRef<AbortController | null>(null), pending = useRef(false), heading = useRef<HTMLHeadingElement>(null);
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    const revision = session.read().revision;
    try {
      const result = await previewGuestAssessment(http, draft, controller.signal);
      if (controller.signal.aborted || session.read().revision !== revision) return;
      save({ ...draft, result }); void navigate(paths.guestAssessmentResult);
    } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof ApiError ? failure.message : 'Chưa xem được kết quả. Đáp án vẫn được giữ.'); }
    finally { pending.current = false; if (!controller.signal.aborted) { setBusy(false); setSubmitting(false); } }
  };
  const question = draft?.catalog.questions[draft.index];
  const total = draft?.catalog.questions.length ?? questions.data?.length;
  const answered = Object.keys(draft?.answers ?? {}).length;
  const welcome = !draft || overview;
  return <HollandWorkspace started={!welcome} stage={submitting ? 'processing' : draft?.result ? 'complete' : 'test'} radar={draft ? <LiveRiasecSummary questions={draft.catalog.questions} answers={draft.answers} /> : undefined}><HollandKeyboard enabled={!welcome && !draft?.result}>
    <div className={`holland-page ${styles.page}`}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {submitting && <AssessmentProcessing />}
      {!guestAssessmentStore.available() && <p className={styles.notice} role="note">Chưa lưu được trên trình duyệt. Giữ trang mở để tránh mất câu trả lời.</p>}
      {guestAssessmentStore.invalid() && <p className={styles.notice}>Chưa đọc được bản nháp trước. Bạn có thể bắt đầu bài mới.</p>}
      {draft?.result ? <section className={styles.welcome}><h1>Bạn đã làm xong bài Holland</h1><p>Kết quả tạm được giữ trong tab này.</p><Link className="btn btn-primary" to={paths.guestAssessmentResult}>Xem kết quả</Link><Button variant="secondary" onClick={() => setDiscard(true)}>Làm bài mới</Button></section> : welcome ? <section className={styles.welcome}>
        <div className={fade.intro}><h1>Trắc nghiệm Holland RIASEC</h1><p className={styles.description}>Trả lời theo cảm nhận của bạn, không có đúng hay sai. Đăng ký sau nếu muốn lưu kết quả, hỏi AIHN hoặc tạo lộ trình.</p></div>
        <div className={styles.stats}><div><strong>{total ?? '…'} câu hỏi</strong><span>TRONG BÀI NÀY</span></div><div><strong>Có / Không</strong><span>THEO CẢM NHẬN</span></div><div><strong>Không cần tài khoản</strong><span>LÀM BÀI VÀ XEM KẾT QUẢ</span></div></div>
        {questions.isError && !draft ? <AsyncState state="error" title="Không tải được bộ câu hỏi." action={<Button onClick={() => { void questions.refetch(); }}>Tải lại câu hỏi</Button>} /> : questions.isPending && !draft ? <AsyncState state="loading" title="Đang tải bộ câu hỏi…" /> : !total ? <p>Bộ đề chưa có câu hỏi.</p> : <Button className={styles.start} aria-label={draft ? 'Tiếp tục' : 'Bắt đầu'} disabled={busy} onClick={() => { if (draft) setOverview(false); else void start(); }}>{busy ? 'Đang bắt đầu…' : draft ? `Tiếp tục (${answered}/${total} câu)` : `Bắt đầu (${total} câu) →`}</Button>}
        <HollandShowcase /><p className={styles.help}>Bài được giữ khi tải lại tab này, trong 24 giờ. Đóng tab có thể mất bài chưa lưu.</p>
      </section> : draft && question && <>
        <div className={styles.utility}><button className={styles.back} disabled={busy} onClick={() => setOverview(true)}>← Quay lại giới thiệu</button><span role="status">{guestAssessmentStore.available() ? 'Đã giữ trong tab này' : 'Chưa lưu trên thiết bị'}</span></div>
        {expired && <p className={styles.notice}>Bài đã hết hạn. Bạn vẫn có thể xem lại đáp án. <Button onClick={() => setDiscard(true)}>Bắt đầu bài mới</Button></p>}
        <header className={styles.testHeading}><p>HIỂU MÌNH · CHỌN HƯỚNG ĐI</p><h2>Khám phá sở thích của bạn</h2></header>
        <div className={styles.questionMeta}><span className={styles.pill}>Nhóm {question.type}</span><span>Câu {draft.index + 1}/{total}</span></div>
        <HollandProgress answered={answered} total={total!} />
        <div className={styles.counts}><span>{answered}/{total} đã trả lời</span><span>{Math.round(answered / total! * 100)}% hoàn thành</span></div>
        <QuestionTransition questionKey={question.id}><section className={styles.question}><h1 ref={heading} tabIndex={-1}>{question.content}</h1><fieldset className={styles.answers} disabled={busy}><legend>Bạn có thích hoạt động này không?</legend><div className={styles.choices}>{[{ check: true, label: 'Có, mình thích' }, { check: false, label: 'Không, mình không thích' }].map(option => <SpotlightCard as="label" data-answer-card="" key={option.label} className={`holland-choice ${styles.choice} ${draft.answers[String(question.id)] === option.check ? styles.selected : ''}`}><input type="radio" name="guest-answer" aria-label={option.label} checked={draft.answers[String(question.id)] === option.check} onChange={() => save({ ...draft, answers: { ...draft.answers, [String(question.id)]: option.check } })} /><span className={styles.choiceIcon} aria-hidden="true">{option.check ? '✓' : '−'}</span><strong>{option.label}</strong><small>{option.check ? 'Mình thích hoạt động này' : 'Mình không thích hoạt động này'}</small></SpotlightCard>)}</div></fieldset></section></QuestionTransition>
        <nav className={styles.nav} aria-label="Chuyển câu hỏi"><Button variant="secondary" disabled={busy || draft.index === 0} onClick={() => save({ ...draft, index: draft.index - 1 })}>Câu trước đó</Button>{draft.index < total! - 1 ? <Button disabled={busy || typeof draft.answers[String(question.id)] !== 'boolean'} onClick={() => save({ ...draft, index: draft.index + 1 })}>Tiếp theo</Button> : <Button disabled={busy || typeof draft.answers[String(question.id)] !== 'boolean'} onClick={() => { void submit(); }}>{busy ? 'Đang tổng kết…' : 'Xem kết quả'}</Button>}</nav>
      </>}
      {discard && <section className={styles.notice} aria-label="Xác nhận làm bài mới"><p>Bài mới sẽ thay bài và kết quả tạm trong tab này.</p><Button variant="secondary" onClick={() => setDiscard(false)}>Giữ bài hiện tại</Button><Button disabled={busy} onClick={() => { setDiscard(false); void start(); }}>Xác nhận làm bài mới</Button></section>}
    </div>
  </HollandKeyboard></HollandWorkspace>;
}
