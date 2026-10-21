import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAppearance, appearanceClass } from '@/shared/appearance/appearance';
import '@/shared/appearance/appearance.css';
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
import './holland.css';

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
  const appearance = useAppearance();
  const current = useSession();
  if (current.status !== 'authenticated' || !current.user) return <AsyncState state="loading" />;
  return (
    <div className={appearanceClass(appearance.value)}>
      <HollandTest
        key={`${current.user.id}:${current.revision}`}
        scope={{ ownerId: current.user.id, revision: current.revision }}
      />
    </div>
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
    if (index !== undefined) {
      heading.current?.focus({ preventScroll: true });
      gsap.fromTo('.question-card', { y: 10, opacity: 0.8 }, { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' });
    }
  }, [index]);
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
  const currentTypeIdx = question ? riasecOrder.indexOf(question.type) : -1;

  return (
    <div className="holland-page">
      <a className="skip-link" href="#main-content">
        Đến câu hỏi
      </a>

      {/* Minimal Top Header for Test Focus (OpenDesign sync) */}
      <header className="test-top-header">
        <Link
          to={paths.dashboard}
          onClick={(event) => {
            if (locked) event.preventDefault();
          }}
          aria-disabled={locked}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', textDecoration: 'none', fontSize: 'var(--font-size-body)', fontWeight: 600 }}
        >
          <Arrow back />
          <span>Tạm dừng &amp; Về Bàn làm việc</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-body)', color: storageOk ? '#047857' : '#D97706', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: storageOk ? '#10B981' : '#F59E0B', display: 'inline-block' }}></span>
          <span role="status">{draft ? (storageOk ? 'Đang tự động lưu tiến độ' : 'Chưa lưu trên thiết bị') : 'Tiến độ lưu trên thiết bị này'}</span>
        </div>
      </header>

      <main id="main-content" className="test-container" tabIndex={-1}>
        {!storageOk && (
          <p className="holland-notice" role="note">
            Không truy cập được bộ nhớ thiết bị. Lựa chọn chỉ được giữ trong màn này; tải lại hoặc rời trang
            có thể mất tiến độ.
          </p>
        )}
        {message && (
          <p className="holland-error" role="alert">
            {message}
          </p>
        )}
        {questions.isPending ? (
          <AsyncState state="loading" title="Đang tải bộ câu hỏi…" />
        ) : questions.isError ? (
          <AsyncState
            state="error"
            title="Không tải được bộ câu hỏi."
            description="Bản nháp hiện có được giữ lại."
            action={
              <Button
                disabled={locked}
                onClick={() => {
                  void questions.refetch();
                }}
              >
                Thử lại câu hỏi
              </Button>
            }
          />
        ) : incompatible || incompatibleCatalog ? (
          <section className="holland-question">
            <h1>Bản nháp không tương thích</h1>
            <p>
              Phiên bản, thang đo hoặc bộ câu hỏi đã thay đổi. Bản nháp vẫn được giữ; không tự chuyển đổi đáp
              án.
            </p>
            {draft?.needsReview && (
              <Button
                disabled={locked}
                onClick={() => {
                  void send('check');
                }}
              >
                Kiểm tra kết quả đã nộp
              </Button>
            )}
            <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>
              Xem xét bỏ bản nháp
            </Button>
          </section>
        ) : !questions.data?.length ? (
          <AsyncState
            state="empty"
            title="Bộ đề chưa có câu hỏi."
            action={
              <Button
                onClick={() => {
                  void questions.refetch();
                }}
              >
                Tải lại câu hỏi
              </Button>
            }
          />
        ) : !draft ? (
          <section className="holland-question holland-intro" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <span className="holland-tag" style={{ background: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4' }}>
              Khám phá sở thích nghề nghiệp
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '8px 0' }}>Trắc nghiệm Sở thích Nghề nghiệp Holland (RIASEC)</h1>
            <p style={{ fontSize: 'var(--font-size-body)', color: '#475569', lineHeight: 1.6 }}>
              {questions.data.length} câu hỏi giúp bạn khám phá 6 nhóm sở thích nghề nghiệp RIASEC. Chọn Có hoặc Không theo cảm nhận thực tế của bạn.
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', color: '#64748B' }}>
              Hãy trả lời đủ các câu và chọn Có cho ít nhất một hoạt động phù hợp. Bạn có thể tạm dừng và tiếp tục trên cùng thiết bị bất kỳ lúc nào.
            </p>
            {blockedStart ? (
              <>
                <p className="holland-error">
                  Chưa xác nhận lần làm trước. Máy chủ chưa hỗ trợ tìm lại lần làm chưa hoàn tất khi thiếu mã.
                </p>
                <Button variant="secondary" onClick={() => setConfirmDiscard(true)}>
                  Xem xét bắt đầu lần mới
                </Button>
              </>
            ) : (
              <Button
                disabled={locked}
                onClick={() => {
                  void begin();
                }}
                style={{ marginTop: '12px' }}
              >
                {busy === 'start'
                  ? 'Đang bắt đầu…'
                  : startCheckpoint.kind === 'ready'
                    ? `Tiếp tục lần làm #${startCheckpoint.attempt?.id}`
                    : 'Bắt đầu bài trắc nghiệm'}
              </Button>
            )}
          </section>
        ) : (
          question && (
            <>
              {/* 6 RIASEC Stepped Indicator Rail */}
              <div className="riasec-steps-rail">
                {riasecOrder.map((code, idx) => {
                  const isCompleted = idx < currentTypeIdx;
                  const isActive = idx === currentTypeIdx;
                  return (
                    <div
                      key={code}
                      className={`riasec-step-item ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
                    >
                      {code} · {groups[code]} ({idx * 10 + 1}–{(idx + 1) * 10})
                    </div>
                  );
                })}
              </div>

              {/* Progress Info Card */}
              <div className="test-header-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--font-size-body)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text-main, #0F172A)' }}>
                    Nhóm {question.type}: Hoạt động {groups[question.type]} {question.dimension && `· ${dimensions[question.dimension]}`} · <span>Câu {draft.index + 1}/{draft.totalQuestions}</span>
                  </span>
                  <span style={{ color: 'var(--color-brand-primary, #0D9488)', fontWeight: 800 }}>
                    {Math.round((completed / draft.totalQuestions) * 100)}% Hoàn thành
                  </span>
                </div>
                <div
                  className="progress-bar-wrap"
                  role="progressbar"
                  aria-label="Số câu đã trả lời"
                  aria-valuemin={0}
                  aria-valuemax={draft.totalQuestions}
                  aria-valuenow={completed}
                >
                  <div className="progress-bar-fill" style={{ width: `${(completed / draft.totalQuestions) * 100}%` }}></div>
                </div>
                <p style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-muted, #64748B)', margin: 0 }}>
                  Hãy chọn theo cảm giác tự nhiên nhất của bạn, không có câu trả lời đúng hay sai.
                </p>
              </div>

              {/* Distraction-Free Question Card */}
              <section className="question-card" aria-busy={locked}>
                <div className="question-category-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
                  <span>NHÓM {question.type} · {groups[question.type].toUpperCase()}</span>
                </div>

                <h1 className="question-text" tabIndex={-1} ref={heading} style={{ margin: 0 }}>
                  {question.content}
                </h1>

                <fieldset className="holland-answers" disabled={locked}>
                  <legend style={{ fontSize: 'var(--font-size-body)', color: '#64748B', marginBottom: '12px', fontWeight: 600 }}>
                    Hoạt động này có phù hợp với sở thích của bạn không?
                  </legend>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {[
                      { value: true, text: 'Có — Tôi thích', icon: '✓', sub: 'Phù hợp với sở thích và mong muốn của bạn' },
                      { value: false, text: 'Không — Tôi không thích', icon: '−', sub: 'Không muốn làm hoặc không cảm thấy phù hợp' },
                    ].map((option) => (
                      <label
                        key={String(option.value)}
                        className={`holland-choice${selected === option.value ? ' selected' : ''}`}
                        style={{
                          padding: '18px 20px',
                          borderRadius: '12px',
                          border: selected === option.value ? '2px solid #0D9488' : '1.5px solid #E2E8F0',
                          background: selected === option.value ? '#F0FDFA' : '#FFFFFF',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: selected === option.value ? '0 0 0 3px rgba(13, 148, 136, 0.15)' : 'none'
                        }}
                      >
                        <input
                          type="radio"
                          name="holland-answer"
                          aria-label={option.text}
                          checked={selected === option.value}
                          onChange={() => {
                            persist({
                              ...draft,
                              answers: { ...draft.answers, [String(question.id)]: option.value },
                            });
                            setMessage('');
                          }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: selected === option.value ? '#0D9488' : '#F1F5F9',
                            color: selected === option.value ? '#FFFFFF' : '#64748B',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 800,
                            fontSize: 'var(--font-size-caption)'
                          }}>{option.icon}</span>
                          <strong style={{ fontSize: 'var(--font-size-body)', color: selected === option.value ? '#0F766E' : '#0F172A' }}>{option.text}</strong>
                        </div>
                        <span style={{ fontSize: 'var(--font-size-caption)', color: selected === option.value ? '#0D9488' : '#64748B', paddingLeft: '32px' }}>{option.sub}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </section>

              {/* Navigation Controls */}
              <nav className="test-nav-row" aria-label="Chuyển câu hỏi">
                <Button
                  aria-label="Câu trước đó"
                  variant="secondary"
                  disabled={locked || draft.index === 0}
                  onClick={() => {
                    persist({ ...draft, index: draft.index - 1 });
                    setMessage('');
                  }}
                >
                  <Arrow back />
                  Câu trước đó
                </Button>
                {draft.index < draft.totalQuestions - 1 ? (
                  <Button
                    aria-label="Tiếp theo"
                    disabled={locked || typeof selected !== 'boolean'}
                    onClick={() => {
                      persist({ ...draft, index: draft.index + 1 });
                      setMessage('');
                    }}
                  >
                    Tiếp theo
                    <Arrow />
                  </Button>
                ) : (
                  <Button
                    disabled={locked || typeof selected !== 'boolean' || (draft.needsReview && !reviewed)}
                    onClick={() => {
                      void send('submit');
                    }}
                  >
                    {busy === 'submit'
                      ? 'Đang nộp…'
                      : draft.needsReview
                        ? 'Nộp lại sau khi kiểm tra'
                        : 'Nộp bài'}
                  </Button>
                )}
              </nav>

              {draft.needsReview && (
                <section className="holland-review">
                  <p>
                    Lần nộp #{draft.attemptId} chưa được xác nhận. Bản nháp vẫn được giữ, kể cả sau khi tải
                    lại.
                  </p>
                  <Button
                    variant="secondary"
                    disabled={locked}
                    onClick={() => {
                      void send('check');
                    }}
                  >
                    {busy === 'check' ? 'Đang kiểm tra…' : 'Kiểm tra kết quả đã nộp'}
                  </Button>
                </section>
              )}
            </>
          )
        )}
        {confirmDiscard && (
          <section className="holland-review" aria-label="Xác nhận bỏ bản nháp">
            <p>
              Bỏ bản nháp trên thiết bị để bắt đầu lần mới? Lần làm cũ trên máy chủ sẽ không bị xóa; đáp án
              chưa nộp không thể khôi phục.
            </p>
            <div className="holland-nav">
              <Button variant="secondary" onClick={() => setConfirmDiscard(false)}>
                Giữ bản nháp
              </Button>
              <Button disabled={locked} onClick={discard}>
                Bỏ bản nháp trên thiết bị
              </Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
