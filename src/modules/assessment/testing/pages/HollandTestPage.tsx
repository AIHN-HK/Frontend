import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
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
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import type { RadarValues } from '@/shared/ui/ce/radar.model';
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
const dimensions = { PERSONA: 'Tính cách', ABILITY: 'Năng lực', INTEREST: 'Sở thích' };
const riasecOrder: RiasecCode[] = ['R', 'I', 'A', 'S', 'E', 'C'];

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
  const questionCard = useRef<HTMLElement>(null);
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
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        if (questionCard.current) gsap.fromTo(questionCard.current, { y: 10, opacity: .8 }, { y: 0, opacity: 1, duration: .25, ease: 'power2.out' });
      });
    }, questionCard);
    return () => ctx.revert();
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
          ? 'Chưa xác nhận lần làm bài đã được tạo. Không tự gửi lại yêu cầu; bạn có thể chọn bắt đầu lần mới sau khi kiểm tra.'
          : 'Không bắt đầu được bài trắc nghiệm. Hãy thử lại.',
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
        setMessage('Vui lòng trả lời đầy đủ các câu hỏi.');
        return;
      }
      if (!Object.values(draft.answers).some(Boolean)) {
        setMessage(
          'Bài trắc nghiệm cần ít nhất một lựa chọn Có. Bạn có thể quay lại xem các hoạt động phù hợp với mình.',
        );
        return;
      }
      if (draft.needsReview && !reviewed) {
        setMessage('Hãy kiểm tra kết quả đã nộp trước khi nộp lại.');
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
            'Chưa tìm thấy kết quả. Yêu cầu nộp trước có thể còn xử lý; hãy chờ và kiểm tra lại, hoặc chủ động nộp lại sau khi xem xét.',
          );
        } else
          setMessage('Không kiểm tra được kết quả. Bản nháp vẫn được giữ; hãy kiểm tra lại trước khi nộp.');
      } else {
        const unknown = !(error instanceof ApiError) || error.outcomeUnknown || error.status === 409;
        if (!unknown) persist({ ...pending, needsReview: false });
        setMessage(
          unknown
            ? 'Chưa xác nhận bài đã được nộp. Bản nháp được giữ; hãy kiểm tra kết quả trước khi thử lại.'
            : 'Không nộp được bài. Bản nháp được giữ; bạn có thể kiểm tra đáp án và thử lại.',
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
      setMessage('Không xóa được bản nháp trên thiết bị. Hãy kiểm tra quyền lưu trữ rồi thử lại.');
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
  const values = Object.fromEntries(riasecOrder.map(code => {
    const answered = draft ? catalog.filter(q => q.type === code && typeof draft.answers[String(q.id)] === 'boolean') : [];
    return [code, answered.length ? answered.filter(q => draft?.answers[String(q.id)]).length / answered.length * 100 : null];
  })) as RadarValues;
  const showWelcome = !draft || overview;
  const steps = [
    { id: 'start', title: 'START', description: 'Giới thiệu & Chuẩn bị', status: showWelcome ? 'active' as const : 'completed' as const },
    { id: 'test', title: 'HOLLAND TEST', description: `${catalog.length} câu hỏi Có / Không`, status: showWelcome ? 'pending' as const : 'active' as const },
    { id: 'code', title: 'TOPCODE', description: 'Nhóm sở thích nổi bật từ kết quả', status: 'pending' as const },
    { id: 'matches', title: 'CAREER MATCHES', description: 'Khám phá nghề nghiệp phù hợp', status: 'pending' as const },
    { id: 'results', title: 'RESULTS', description: 'Báo cáo & Lộ trình phát triển', status: 'pending' as const },
  ];

  return <CareerScreenFrame sidebar={<TimelineSidebar steps={steps} radarTitle="Bản đồ RIASEC trực tiếp" radar={<>
    <RadarChart values={values} label="Biểu đồ câu trả lời tạm thời, chưa phải kết quả Holland" />
    <p className={styles.radarNote}>Câu trả lời tạm thời · Chưa phải kết quả Holland.</p>
    <ul className={styles.legend}>{riasecOrder.map(code => {
      const group = catalog.filter(q => q.type === code);
      const answered = group.filter(q => draft && typeof draft.answers[String(q.id)] === 'boolean');
      return <li key={code}><span style={{ color: `var(--ce-${code.toLowerCase()})` }}>●</span> {code}: {groups[code]}<small>{answered.filter(q => draft?.answers[String(q.id)]).length} Có / {answered.length} đã trả lời · {group.length} câu</small></li>;
    })}</ul>
  </>} />}>
    <div className={`holland-page ${styles.page}`}>
      <div className={styles.utility} hidden={showWelcome && storageOk}>
        <Link to={paths.dashboard} aria-disabled={locked} onClick={event => { if (locked) event.preventDefault(); }}><Arrow back /> Tạm dừng &amp; Về Bàn làm việc</Link>
        <span role="status">{draft ? (storageOk ? 'Đang tự động lưu tiến độ' : 'Chưa lưu trên thiết bị') : 'Tiến độ lưu trên thiết bị này'}</span>
      </div>
      {!storageOk && <p className={styles.notice} role="note">Không truy cập được bộ nhớ thiết bị. Lựa chọn chỉ được giữ trong màn này; tải lại hoặc rời trang có thể mất tiến độ.</p>}
      {message && <p className={styles.error} role="alert">{message}</p>}
      {questions.isPending ? <AsyncState state="loading" title="Đang tải bộ câu hỏi…" /> : questions.isError ? <AsyncState state="error" title="Không tải được bộ câu hỏi." description="Bản nháp hiện có được giữ lại." action={<Button disabled={locked} onClick={() => { void questions.refetch(); }}>Thử lại câu hỏi</Button>} /> : incompatible || incompatibleCatalog ? <section className={styles.notice}>
        <h1>Bản nháp không tương thích</h1><p>Phiên bản, thang đo hoặc bộ câu hỏi đã thay đổi. Bản nháp vẫn được giữ; không tự chuyển đổi đáp án.</p>
        {draft?.needsReview && <Button disabled={locked} onClick={() => { void send('check'); }}>Kiểm tra kết quả đã nộp</Button>}
        <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>Xem xét bỏ bản nháp</Button>
      </section> : !questions.data?.length ? <AsyncState state="empty" title="Bộ đề chưa có câu hỏi." action={<Button onClick={() => { void questions.refetch(); }}>Tải lại câu hỏi</Button>} /> : showWelcome ? <section className={styles.welcome}>
        <h1>Trắc nghiệm Holland RIASEC</h1>
        <p className={styles.description}>Khám phá sở thích nghề nghiệp cùng AIHN Career. Hiểu 6 nhóm R–I–A–S–E–C và tìm hiểu những nghề nghiệp tương thích với kết quả của bạn.</p>
        <div className={styles.stats}><div><strong>{catalog.length} câu hỏi</strong><span>BỘ ĐỀ HIỆN TẠI</span></div><div><strong>Có / Không</strong><span>THEO CẢM NHẬN CỦA BẠN</span></div><div><strong>TopCode</strong><span>6 NHÓM SỞ THÍCH</span></div></div>
        {blockedStart ? <div className={styles.notice}><p>Chưa xác nhận lần làm trước. Máy chủ chưa hỗ trợ tìm lại lần làm chưa hoàn tất khi thiếu mã.</p><Button variant="secondary" onClick={() => setConfirmDiscard(true)}>Xem xét bắt đầu lần mới</Button></div> : <Button className={styles.start} disabled={locked} aria-label={draft ? 'Tiếp tục bài đang làm' : busy === 'start' ? 'Đang bắt đầu…' : startCheckpoint.kind === 'ready' ? `Tiếp tục lần làm #${startCheckpoint.attempt?.id}` : 'Bắt đầu bài trắc nghiệm'} onClick={() => { if (draft) setOverview(false); else void begin(); }}>{draft ? `Tiếp tục bài đang làm (${completed}/${draft.totalQuestions} câu)` : busy === 'start' ? 'Đang bắt đầu…' : startCheckpoint.kind === 'ready' ? `Tiếp tục lần làm #${startCheckpoint.attempt?.id}` : `Bắt đầu làm bài trắc nghiệm (${catalog.length} câu) →`}</Button>}
        <HollandShowcase />
        <p className={styles.help}>Hãy trả lời đủ các câu và chọn Có cho ít nhất một hoạt động phù hợp. Bạn có thể tạm dừng và tiếp tục trên cùng thiết bị.</p>
      </section> : draft && question && <>
        <button type="button" className={styles.back} disabled={locked} onClick={() => setOverview(true)}><Arrow back /> Quay lại giới thiệu</button>
        <div className={styles.questionMeta}><span className={styles.pill}>{question.type} · {groups[question.type]}{question.dimension && ` · ${dimensions[question.dimension]}`}</span><span>Câu {draft.index + 1}/{draft.totalQuestions}</span></div>
        <div className={styles.progress} role="progressbar" aria-label="Số câu đã trả lời" aria-valuemin={0} aria-valuemax={draft.totalQuestions} aria-valuenow={completed}><span style={{ width: `${completed / draft.totalQuestions * 100}%` }} /></div>
        <div className={styles.counts}><span>{completed}/{draft.totalQuestions} đã trả lời</span><span>{Math.round(completed / draft.totalQuestions * 100)}% hoàn thành</span></div>
        <section ref={questionCard} className={styles.question} aria-busy={locked}>
          <h1 tabIndex={-1} ref={heading}>{question.content}</h1>
          <fieldset className={styles.answers} disabled={locked}><legend>Hoạt động này có phù hợp với sở thích của bạn không?</legend><div className={styles.choices}>
            {[{ value: true, text: 'Có — Tôi thích', detail: 'Phù hợp với sở thích của tôi', icon: '✓' }, { value: false, text: 'Không — Tôi không thích', detail: 'Không cảm thấy phù hợp', icon: '−' }].map(option => <label key={String(option.value)} className={`holland-choice ${styles.choice} ${selected === option.value ? styles.selected : ''}`}>
              <input type="radio" name="holland-answer" aria-label={option.text} checked={selected === option.value} onChange={() => { persist({ ...draft, answers: { ...draft.answers, [String(question.id)]: option.value } }); setMessage(''); }} />
              <span className={styles.choiceIcon} aria-hidden="true">{option.icon}</span><strong>{option.text}</strong><small>{option.detail}</small>
            </label>)}
          </div></fieldset>
        </section>
        <nav className={styles.nav} aria-label="Chuyển câu hỏi"><Button aria-label="Câu trước đó" variant="secondary" disabled={locked || draft.index === 0} onClick={() => { persist({ ...draft, index: draft.index - 1 }); setMessage(''); }}><Arrow back /> Câu trước đó</Button>
          {draft.index < draft.totalQuestions - 1 ? <Button aria-label="Tiếp theo" disabled={locked || typeof selected !== 'boolean'} onClick={() => { persist({ ...draft, index: draft.index + 1 }); setMessage(''); }}>Tiếp theo <Arrow /></Button> : <Button disabled={locked || typeof selected !== 'boolean' || (draft.needsReview && !reviewed)} onClick={() => { void send('submit'); }}>{busy === 'submit' ? 'Đang nộp…' : draft.needsReview ? 'Nộp lại sau khi kiểm tra' : 'Nộp bài'}</Button>}
        </nav>
        {draft.needsReview && <section className={styles.notice}><p>Lần nộp #{draft.attemptId} chưa được xác nhận. Bản nháp vẫn được giữ, kể cả sau khi tải lại.</p><Button variant="secondary" disabled={locked} onClick={() => { void send('check'); }}>{busy === 'check' ? 'Đang kiểm tra…' : 'Kiểm tra kết quả đã nộp'}</Button></section>}
      </>}
      {confirmDiscard && <section className={styles.notice} aria-label="Xác nhận bỏ bản nháp"><p>Bỏ bản nháp trên thiết bị để bắt đầu lần mới? Lần làm cũ trên máy chủ sẽ không bị xóa; đáp án chưa nộp không thể khôi phục.</p><div className={styles.nav}><Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Giữ bản nháp</Button><Button disabled={locked} onClick={discard}>Bỏ bản nháp trên thiết bị</Button></div></section>}
    </div>
  </CareerScreenFrame>;
}
