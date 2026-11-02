import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { useSession } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { AsyncState } from '@/shared/ui/AsyncState';
import {
  isAssessmentScopeCurrent,
  useAssessmentCommand,
  useAssessmentQuestionsQuery,
} from '../../queries/assessment.queries';
import type {
  AssessmentAttempt,
  AssessmentDraft,
  AssessmentScope,
  RiasecCode,
} from '../../model/assessment.types';
import { assessmentDraftStore, isCatalogCompatible } from '../model/assessment.draft';
import { SpotlightCard } from '@/shared/ui/SpotlightCard';
import { HollandWorkspace } from '../components/HollandWorkspace';
import { HollandProgress } from '../components/HollandProgress';
import { HollandKeyboard } from '../components/HollandKeyboard';
import { QuestionTransition } from '../components/QuestionTransition';
import { AssessmentProcessing } from '../components/AssessmentProcessing';
import { LiveRiasecSummary } from '../components/LiveRiasecSummary';
import { HollandShowcase } from '../components/HollandShowcase';
import styles from './HollandTestPage.module.css';

const groups: Record<RiasecCode, string> = {
  R: 'Thực tế',
  I: 'Nghiên cứu',
  A: 'Nghệ thuật',
  S: 'Xã hội',
  E: 'Quản lý',
  C: 'Nghiệp vụ',
};
const dimensions = { PERSONA: 'Đặc điểm', ABILITY: 'Năng lực', INTEREST: 'Sở thích' };

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d={back ? 'M19 12H5M12 19l-7-7 7-7' : 'M5 12h14M12 5l7 7-7 7'} />
    </svg>
  );
}

export function HollandTestPage() {
  const current = useSession();
  if (current.status !== 'authenticated' || !current.user) return <AsyncState state="loading" />;
  return (
      <HollandTest
        key={`${current.user.id}:${current.revision}`}
        scope={{ ownerId: current.user.id, revision: current.revision }}
      />
  );
}

function HollandTest({ scope }: { scope: AssessmentScope }) {
  const navigate = useNavigate(),
    questions = useAssessmentQuestionsQuery(),
    command = useAssessmentCommand();
  const [initial] = useState(() => assessmentDraftStore.read(scope.ownerId));
  const [draft, setDraft] = useState<AssessmentDraft | null>(() =>
    initial.kind === 'ready' ? initial.draft : null,
  );
  const [overview, setOverview] = useState(false);
  const [incompatible, setIncompatible] = useState(initial.kind === 'incompatible');
  const [startCheckpoint, setStartCheckpoint] = useState(() => assessmentDraftStore.readStart(scope.ownerId));
  const [storageOk, setStorageOk] = useState(initial.kind !== 'unavailable');
  const [busy, setBusy] = useState<'start' | 'submit' | 'check' | null>(null);
  const [message, setMessage] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const mutex = useRef(false),
    controller = useRef<AbortController | null>(null),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const active = new AbortController();
    controller.current = active;
    return () => {
      active.abort();
    };
  }, []);
  const index = draft?.index;
  useEffect(() => {
    if (index === undefined || overview) return;
    heading.current?.focus({ preventScroll: true });
  }, [index, overview]);
  const signal = () => controller.current?.signal;
  const current = (active: AbortSignal) => isAssessmentScopeCurrent(scope, active);
  const persist = (next: AssessmentDraft) => {
    const active = signal();
    if (!active || !current(active)) return;
    setStorageOk(assessmentDraftStore.write(scope.ownerId, next));
    setDraft(next);
  };
  const begin = async () => {
    const active = signal();
    if (!active || !current(active) || mutex.current || !questions.data?.length) return;
    mutex.current = true;
    setBusy('start');
    setMessage('');
    let attempt: AssessmentAttempt | null = startCheckpoint.kind === 'ready' ? startCheckpoint.attempt : null;
    try {
      if (!attempt) {
        setStorageOk(assessmentDraftStore.markStart(scope.ownerId, null));
        setStartCheckpoint({ kind: 'ready', attempt: null });
        const response = await command.mutateAsync({ action: 'start', scope, signal: active });
        if (!current(active) || !('id' in response)) return;
        attempt = response;
        setStorageOk(assessmentDraftStore.markStart(scope.ownerId, attempt));
        setStartCheckpoint({ kind: 'ready', attempt });
      }
      // The attempt freezes question edits in the existing backend. Read again after creation.
      const catalog = await questions.refetch();
      if (!current(active)) return;
      if (!catalog.data || catalog.isError || catalog.data.length !== attempt.totalQuestions) {
        setMessage(
          `Chưa khớp bộ câu hỏi của lần làm #${attempt.id}. Hãy tải lại câu hỏi để tiếp tục, không tạo lần làm khác.`,
        );
        return;
      }
      const next: AssessmentDraft = {
        version: 1,
        scale: 'boolean',
        ownerId: scope.ownerId,
        attemptId: attempt.id,
        totalQuestions: attempt.totalQuestions,
        questions: catalog.data,
        answers: {},
        index: 0,
        needsReview: false,
      };
      const saved = assessmentDraftStore.write(scope.ownerId, next);
      setStorageOk(saved);
      setDraft(next);
      setOverview(false);
      if (saved) assessmentDraftStore.clearStart(scope.ownerId);
      setStartCheckpoint({ kind: 'missing' });
    } catch (error) {
      if (!current(active)) return;
      const unknown = error instanceof ApiError && error.outcomeUnknown;
      if (!unknown && !attempt) {
        assessmentDraftStore.clearStart(scope.ownerId);
        setStartCheckpoint({ kind: 'missing' });
      }
      setMessage(
        unknown
          ? 'Chưa xác nhận đã mở được bài. Kiểm tra trước khi chọn bắt đầu bài mới.'
          : 'Chưa mở được bài. Bạn thử lại nhé.',
      );
    } finally {
      mutex.current = false;
      if (current(active)) setBusy(null);
    }
  };
  const complete = (attemptId: number) => {
    assessmentDraftStore.clear(scope.ownerId, attemptId);
    assessmentDraftStore.clearStart(scope.ownerId);
    void navigate(paths.assessmentResult(attemptId));
  };
  const send = async (action: 'submit' | 'check') => {
    const active = signal();
    if (!active || !current(active) || mutex.current || !draft) return;
    if (action === 'submit') {
      if (draft.questions.some((question) => typeof draft.answers[String(question.id)] !== 'boolean')) {
        setMessage('Trả lời các câu còn lại để xem kết quả.');
        return;
      }
      if (!Object.values(draft.answers).some(Boolean)) {
        setMessage(
          'Bài cần ít nhất một lựa chọn Có để tính kết quả. Bạn xem lại có hoạt động nào mình thích nhé.',
        );
        return;
      }
      if (draft.needsReview && !reviewed) {
        setMessage('Kiểm tra kết quả trước khi nộp lại.');
        return;
      }
    }
    mutex.current = true;
    setBusy(action);
    setMessage('');
    setReviewed(false);
    const pending = action === 'submit' ? { ...draft, needsReview: true } : draft;
    if (action === 'submit') persist(pending);
    try {
      const response = await command.mutateAsync(
        action === 'submit'
          ? { action, scope, signal: active, draft: pending }
          : { action, scope, signal: active, attemptId: draft.attemptId },
      );
      if (current(active) && 'attemptId' in response) complete(response.attemptId);
    } catch (error) {
      if (!current(active)) return;
      if (action === 'check') {
        if (error instanceof ApiError && error.status === 404) {
          setReviewed(true);
          setMessage(
            'Chưa thấy kết quả. Bài có thể đang được xử lý. Chờ và kiểm tra trước khi nộp lại.',
          );
        } else
          setMessage('Chưa kiểm tra được kết quả. Bản nháp vẫn được giữ. Kiểm tra lại trước khi nộp.');
      } else {
        const unknown = !(error instanceof ApiError) || error.outcomeUnknown || error.status === 409;
        if (!unknown) persist({ ...pending, needsReview: false });
        setMessage(
          unknown
            ? 'Chưa xác nhận đã nộp bài. Bản nháp vẫn được giữ. Kiểm tra kết quả trước khi nộp lại.'
            : 'Chưa nộp được bài. Bản nháp vẫn còn. Kiểm tra đáp án rồi thử lại.',
        );
      }
    } finally {
      mutex.current = false;
      if (current(active)) setBusy(null);
    }
  };
  const discard = () => {
    const active = signal();
    if (!active || !current(active)) return;
    if (mutex.current) return;
    const removed = assessmentDraftStore.discard(scope.ownerId),
      removedStart = assessmentDraftStore.clearStart(scope.ownerId);
    if (!removed || !removedStart) {
      setStorageOk(false);
      setMessage('Chưa xóa được bản nháp. Kiểm tra quyền lưu trữ rồi thử lại.');
      return;
    }
    setDraft(null);
    setOverview(false);
    setIncompatible(false);
    setStartCheckpoint({ kind: 'missing' });
    setConfirmDiscard(false);
    setMessage('');
    setReviewed(false);
  };
  const question = draft?.questions[draft.index];
  const incompatibleCatalog = Boolean(draft && questions.data && !isCatalogCompatible(draft, questions.data));
  const completed = draft ? Object.keys(draft.answers).length : 0;
  const selected = question && draft ? draft.answers[String(question.id)] : undefined;
  const blockedStart =
    startCheckpoint.kind === 'incompatible' ||
    (startCheckpoint.kind === 'ready' && startCheckpoint.attempt === null);
  const locked = busy !== null;
  const catalog = draft?.questions ?? questions.data ?? [];
  const showWelcome = !draft || overview;
  return <HollandWorkspace started={!showWelcome} stage={busy === 'submit' || busy === 'check' ? 'processing' : 'test'} radar={<LiveRiasecSummary questions={catalog} answers={draft?.answers ?? {}} />}><HollandKeyboard enabled={!showWelcome}>
    <div className={`holland-page ${styles.page}`}>
      <div className={styles.utility} hidden={showWelcome && storageOk}>
        <Link to={paths.dashboard} aria-disabled={locked} onClick={event => { if (locked) event.preventDefault(); }}><Arrow back /> Tạm dừng và về trang của tôi</Link>
        <span role="status">{draft ? (storageOk ? 'Đang lưu tiến độ…' : 'Chưa lưu trên thiết bị') : 'Đã lưu trên thiết bị này'}</span>
      </div>
      {!storageOk && <p className={styles.notice} role="note">Chưa lưu được trên thiết bị. Giữ trang mở để tránh mất câu trả lời.</p>}
      {message && <p className={styles.error} role="alert">{message}</p>}
      {(busy === 'submit' || busy === 'check') && <AssessmentProcessing checking={busy === 'check'} />}
      {questions.isPending ? <AsyncState state="loading" title="Đang tải bộ câu hỏi…" /> : questions.isError ? <AsyncState state="error" title="Không tải được bộ câu hỏi." description="Bản nháp hiện có được giữ lại." action={<Button disabled={locked} onClick={() => { void questions.refetch(); }}>Tải lại câu hỏi</Button>} /> : incompatible || incompatibleCatalog ? <section className={styles.notice}>
        <h1>Bản nháp cần kiểm tra lại</h1><p>Bộ đề hoặc thang trả lời đã thay đổi. Bản nháp vẫn được giữ, đáp án chưa được chuyển đổi.</p>
        {draft?.needsReview && <Button disabled={locked} onClick={() => { void send('check'); }}>Kiểm tra kết quả đã nộp</Button>}
        <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>Bỏ bản nháp</Button>
      </section> : !questions.data?.length ? <AsyncState state="empty" title="Bộ đề chưa có câu hỏi." action={<Button onClick={() => { void questions.refetch(); }}>Tải lại câu hỏi</Button>} /> : showWelcome ? <section className={styles.welcome}>
        <h1>Trắc nghiệm Holland RIASEC</h1>
        <p className={styles.description}>Trả lời theo cảm nhận của bạn. Kết quả giúp bạn nhìn lại sở thích, không quyết định bạn phải làm nghề gì.</p>
        <div className={styles.stats}><div><strong>{catalog.length} câu hỏi</strong><span>TRONG BÀI NÀY</span></div><div><strong>Có / Không</strong><span>THEO CẢM NHẬN</span></div><div><strong>TopCode</strong><span>6 NHÓM SỞ THÍCH</span></div></div>
        {blockedStart ? <div className={styles.notice}><p>Chưa xác nhận lần làm trước. Không có mã nên chưa tìm lại được bài đang làm.</p><Button variant="secondary" onClick={() => setConfirmDiscard(true)}>Bắt đầu bài mới</Button></div> : <Button className={styles.start} disabled={locked} aria-label={draft ? 'Tiếp tục' : busy === 'start' ? 'Đang bắt đầu…' : startCheckpoint.kind === 'ready' ? `Tiếp tục lần làm #${startCheckpoint.attempt?.id}` : 'Bắt đầu'} onClick={() => { if (draft) setOverview(false); else void begin(); }}>{draft ? `Tiếp tục (${completed}/${draft.totalQuestions} câu)` : busy === 'start' ? 'Đang bắt đầu…' : startCheckpoint.kind === 'ready' ? `Tiếp tục lần làm #${startCheckpoint.attempt?.id}` : `Bắt đầu (${catalog.length} câu) →`}</Button>}
        <HollandShowcase />
        <p className={styles.help}>Trả lời đủ các câu, có ít nhất một lựa chọn Có. Bạn có thể tạm dừng rồi tiếp tục trên thiết bị này.</p>
      </section> : draft && question && <>
        <button type="button" className={styles.back} disabled={locked} onClick={() => setOverview(true)}><Arrow back /> Quay lại giới thiệu</button>
        <header className={styles.testHeading}><p>HIỂU MÌNH · CHỌN HƯỚNG ĐI</p><h2>Khám phá sở thích của bạn</h2></header>
        <div className={styles.questionMeta}><span className={styles.pill}>{question.type} · {groups[question.type]}{question.dimension && ` · ${dimensions[question.dimension]}`}</span><span>Câu {draft.index + 1}/{draft.totalQuestions}</span></div>
        <HollandProgress answered={completed} total={draft.totalQuestions} />
        <div className={styles.counts}><span>{completed}/{draft.totalQuestions} đã trả lời</span><span>{Math.round(completed / draft.totalQuestions * 100)}% hoàn thành</span></div>
        <QuestionTransition questionKey={question.id}><section className={styles.question} aria-busy={locked}>
          <h1 tabIndex={-1} ref={heading}>{question.content}</h1>
          <fieldset className={styles.answers} disabled={locked}><legend>Bạn có thích hoạt động này không?</legend><div className={styles.choices}>
            {[{ value: true, text: 'Có, mình thích', detail: 'Mình thích hoạt động này', icon: '✓' }, { value: false, text: 'Không, mình không thích', detail: 'Mình không thích hoạt động này', icon: '−' }].map(option => <SpotlightCard as="label" data-answer-card="" key={String(option.value)} className={`holland-choice ${styles.choice} ${selected === option.value ? styles.selected : ''}`}>
              <input type="radio" name="holland-answer" aria-label={option.text} checked={selected === option.value} onChange={() => { persist({ ...draft, answers: { ...draft.answers, [String(question.id)]: option.value } }); setMessage(''); }} />
              <span className={styles.choiceIcon} aria-hidden="true">{option.icon}</span><strong>{option.text}</strong><small>{option.detail}</small>
            </SpotlightCard>)}
          </div></fieldset>
        </section></QuestionTransition>
        <nav className={styles.nav} aria-label="Chuyển câu hỏi"><Button aria-label="Câu trước đó" variant="secondary" disabled={locked || draft.index === 0} onClick={() => { persist({ ...draft, index: draft.index - 1 }); setMessage(''); }}><Arrow back /> Câu trước đó</Button>
          {draft.index < draft.totalQuestions - 1 ? <Button aria-label="Tiếp theo" disabled={locked || typeof selected !== 'boolean'} onClick={() => { persist({ ...draft, index: draft.index + 1 }); setMessage(''); }}>Tiếp theo <Arrow /></Button> : <Button disabled={locked || typeof selected !== 'boolean' || (draft.needsReview && !reviewed)} onClick={() => { void send('submit'); }}>{busy === 'submit' ? 'Đang nộp…' : draft.needsReview ? 'Nộp lại sau khi kiểm tra' : 'Nộp bài'}</Button>}
        </nav>
        {draft.needsReview && <section className={styles.notice}><p>Lần nộp #{draft.attemptId} chưa được xác nhận. Bản nháp vẫn được giữ, kể cả sau khi tải lại.</p><Button variant="secondary" disabled={locked} onClick={() => { void send('check'); }}>{busy === 'check' ? 'Đang kiểm tra…' : 'Kiểm tra kết quả đã nộp'}</Button></section>}
      </>}
      {confirmDiscard && <section className={styles.notice} aria-label="Xác nhận bỏ bản nháp"><p>Bỏ bản nháp để làm bài mới? Đáp án chưa nộp sẽ mất. Lần làm cũ trên tài khoản vẫn được giữ.</p><div className={styles.nav}><Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Giữ bản nháp</Button><Button disabled={locked} onClick={discard}>Bỏ bản nháp</Button></div></section>}
    </div>
  </HollandKeyboard></HollandWorkspace>;
}
