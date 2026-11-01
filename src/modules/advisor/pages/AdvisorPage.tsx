import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAssessmentHistoryQuery } from '@/modules/assessment';
import { useAuth } from '@/modules/auth';
import { session, useSession } from '@/shared/session/session';
import { getEnvironment } from '@/shared/config/env';
import { Button } from 'antd';
import { paths } from '@/routes/paths';
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
import { createAdvisorController, socketTransport } from '../model/advisor.socket';
import { browserDraftStorage, createAdvisorDraftStore } from '../model/advisor.draft';
import { isBusy, parseSessionId } from '../model/message.types';
import { advisorMessagesKey, useAdvisorQueries } from '../queries/advisor.queries';
import { AdvisorComposer } from '../components/AdvisorComposer';
import { AdvisorReplySkeleton } from '../components/AdvisorReplySkeleton';
import { isAdvisorSoundEnabled, playAdvisorReplySound, setAdvisorSoundEnabled } from '../model/advisor-sound';
import styles from './AdvisorPage.module.css';

export function AdvisorPage() {
  const current = useSession();
  if (!current.user) return null;
  return <AdvisorWorkspace key={`${current.user.id}:${current.revision}`} ownerId={current.user.id} revision={current.revision} />;
}
function AdvisorWorkspace({ ownerId, revision }: { ownerId: number; revision: number }) {
  const [params] = useSearchParams(), rawId = params.get('sessionId'), selectedId = parseSessionId(rawId), invalidId = rawId !== null && selectedId === null;
  const [contextOpen, setContextOpen] = useState(() => window.matchMedia('(min-width: 901px)').matches);
  const [soundOn, setSoundOn] = useState(() => isAdvisorSoundEnabled());
  const navigate = useNavigate(), queryClient = useQueryClient(), auth = useAuth(), history = useAssessmentHistoryQuery();
  const { sessions, messages } = useAdvisorQueries(invalidId ? null : selectedId), log = useRef<HTMLDivElement>(null), atEnd = useRef(true);
  const controller = useMemo(() => createAdvisorController({
    ownerId, revision, session, transport: socketTransport(getEnvironment().socketOrigin),
    onConnected: connected => {
      const newDraft = createAdvisorDraftStore(ownerId, null, browserDraftStorage()), target = createAdvisorDraftStore(ownerId, connected.sessionId, browserDraftStorage());
      if (newDraft.read().content && !target.read().content && !target.read().blocked && !newDraft.read().needsReview) { if (target.write(newDraft.read().content, false)) newDraft.write('', false); }
      navigate(paths.advisorSession(connected.sessionId), { replace: true });
      void queryClient.invalidateQueries({ queryKey: ['history', 'chats', ownerId, revision] });
    },
    onOutcome: (phase, sessionId, question) => {
      const draft = createAdvisorDraftStore(ownerId, sessionId, browserDraftStorage());
      if (phase === 'awaiting' || phase === 'failed' || phase === 'cancelled' || phase === 'unknown') draft.write(question, true);
      if (phase === 'completed') {
        if (draft.read().content === question) draft.write('', false);
        void queryClient.invalidateQueries({ queryKey: advisorMessagesKey(ownerId, revision, sessionId) });
        playAdvisorReplySound();
      }
      if (phase !== 'awaiting') void queryClient.invalidateQueries({ queryKey: ['history', 'chats', ownerId, revision] });
    },
  }), [ownerId, revision, navigate, queryClient]);
  const view = useSyncExternalStore(controller.subscribe, controller.read, controller.read), live = selectedId !== null && view.connected?.sessionId === selectedId && (view.connection === 'ready' || view.connection === 'auth');
  useEffect(() => controller.mount(), [controller]);
  useEffect(() => { const media = window.matchMedia('(min-width: 901px)'); const update = (event: MediaQueryListEvent) => setContextOpen(event.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update); }, []);
  useEffect(() => { const active = controller.read().connected; if (active && active.sessionId !== selectedId) controller.disconnect(); }, [controller, selectedId]);
  useEffect(() => { if (atEnd.current && log.current) log.current.scrollTop = log.current.scrollHeight; }, [selectedId, messages.data, view.turn?.answer, view.phase]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const keyboard = () => { if (document.activeElement instanceof HTMLTextAreaElement) document.activeElement.scrollIntoView({ block: 'nearest' }); };
    viewport?.addEventListener('resize', keyboard); return () => { viewport?.removeEventListener('resize', keyboard); };
  }, []);
  const saved = messages.data ?? [], selected = sessions.data?.find(item => item.id === selectedId), turn = view.turn?.sessionId === selectedId ? view.turn : null;
  const storedUser = turn ? saved.some(item => item.role === 'user' && item.content === turn.question && !turn.savedIds.includes(item.id)) : false;
  const storedAnswer = turn && view.phase === 'completed' && saved.some(item => item.role === 'assistant' && !turn.savedIds.includes(item.id));
  const showTurn = turn && !storedAnswer;
  const waitingForReply = live && turn && !turn.answer && ['awaiting', 'queued', 'streaming'].includes(view.phase);
  const startNew = () => { controller.disconnect(); navigate(paths.advisor); };
  const status = view.authPending ? 'Đang xác thực lại…' : view.phase === 'awaiting' ? 'Đang gửi câu hỏi…' : view.phase === 'queued' ? 'Câu hỏi đang chờ được trả lời…' : view.phase === 'streaming' ? 'AIHN đang trả lời…' : view.phase === 'stopping' ? 'Đang yêu cầu dừng trả lời…' : view.phase === 'completed' ? 'Đã trả lời xong.' : view.connection === 'connecting' ? 'Đang kết nối hội thoại…' : live ? 'Đã kết nối hội thoại.' : 'Kết nối để bắt đầu trao đổi.';
  return <div className={`${styles.page} advisor-page`}>
    <aside className="advisor-context" aria-label="Hồ sơ và hội thoại">
      <div className="advisor-heading"><LottieIllustration kind="advisor" size={52} animate={false} /><div><h1 className="text-lg">Hỏi AIHN</h1><p className="advisor-caption text-xs">Cùng gỡ điều còn phân vân</p></div></div>
      <details className="advisor-context-details" open={contextOpen} onToggle={event => setContextOpen(event.currentTarget.open)}><summary className="text-sm">Thông tin dùng khi trao đổi</summary><div className="advisor-context-block"><p className="text-sm">Hội thoại dùng hồ sơ và kết quả Holland của lần tư vấn này.</p>{live && view.connected ? <Link className="btn btn-ghost text-sm" to={paths.assessmentResult(view.connected.attemptId)}>Xem kết quả của phiên #{view.connected.attemptId}</Link> : <p className="advisor-caption text-xs">Chưa xác định được kết quả của hội thoại này.</p>}</div>
      <p className="advisor-caption text-xs">AIHN dùng kỹ năng, sở thích, mục tiêu, gợi ý và tiến độ đã lưu. Phần thiếu được để trống. Trao đổi ở đây không tự thay đổi hồ sơ hay tiến độ.</p></details>
      <div className="advisor-session-controls"><label htmlFor="advisor-session" className="text-sm">Phiên tư vấn</label><select id="advisor-session" className="text-sm" value={selectedId === null ? '' : String(selectedId)} onChange={event => { controller.disconnect(); navigate(event.target.value ? paths.advisorSession(event.target.value) : paths.advisor); }}><option value="">Hội thoại mới</option>{selectedId !== null && !selected && <option value={selectedId}>Phiên #{selectedId}</option>}{sessions.data?.map(item => <option key={item.id} value={item.id}>{item.title?.trim() || `Phiên #${item.id}`} · {item.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}</option>)}</select>
        {sessions.isPending ? <p role="status" className="text-sm">Đang tải danh sách phiên…</p> : sessions.isError && <div role="alert"><p className="text-sm">Không tải được danh sách phiên tư vấn.</p><Button className="text-sm" disabled={sessions.isFetching} onClick={() => { void sessions.refetch(); }}>Tải lại danh sách</Button></div>}
        {sessions.isSuccess && !sessions.data.length && <p className="advisor-caption text-xs">Chưa có hội thoại nào được lưu.</p>}
        <Button className="text-sm" onClick={startNew}>Hội thoại mới</Button><Link className="btn btn-ghost text-sm" to={`${paths.history}?kind=chats`}>Xem lịch sử</Link>
      </div>
    </aside>
    <section className="advisor-chat" aria-label="Trao đổi với AIHN">
      <header className="advisor-chat-header"><div><h2 className="text-lg">{selectedId === null ? 'Hội thoại mới' : selected?.title?.trim() || `Phiên tư vấn #${selectedId}`}</h2><p className="advisor-caption text-xs" role="status">{status}</p></div>
        <div className={styles.chatHeaderControls}>
          <button
            type="button"
            className={styles.soundButton}
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              setAdvisorSoundEnabled(next);
            }}
            title={soundOn ? 'Tắt âm thanh thông báo' : 'Bật âm thanh thông báo'}
            aria-label={soundOn ? 'Tắt âm thanh thông báo' : 'Bật âm thanh thông báo'}
          >
            <span aria-hidden="true">{soundOn ? '🔊' : '🔇'}</span>
            <span>{soundOn ? 'Âm thanh bật' : 'Tắt âm'}</span>
          </button>
          {selectedId === null && !invalidId && <>
            {history.isPending ? <p role="status" className="text-sm">Đang kiểm tra kết quả Holland…</p> : history.isError ? <div role="alert"><p className="text-sm">Chưa kiểm tra được kết quả Holland để mở hội thoại.</p><Button className="text-sm" disabled={history.isFetching} onClick={() => { void history.refetch(); }}>Kiểm tra kết quả</Button></div> : !history.data.length ? <div><p className="text-sm">Làm trắc nghiệm Holland để AIHN có cơ sở trao đổi cùng bạn.</p><Link className="btn btn-secondary text-sm" to={paths.assessment}>Làm trắc nghiệm</Link></div> : view.connection === 'connecting' ? <p role="status" className="text-sm">Đang kết nối hội thoại…</p> : <Button type="primary" className="text-base" onClick={controller.begin}>Kết nối</Button>}
          </>}
          {live && ['queued', 'streaming', 'stopping'].includes(view.phase) && <Button className="text-sm" disabled={view.phase === 'stopping' || view.authPending} onClick={controller.stop}>Dừng trả lời</Button>}
        </div>
      </header>
      {selectedId !== null && !live && <p className="advisor-readonly text-sm">Bạn đang đọc lại hội thoại đã lưu.</p>}
      {view.notice && <div className="advisor-notice text-sm" role="alert"><p>{view.notice}</p>{view.connection === 'auth' && <Button className="text-sm" disabled={view.authPending} onClick={async () => { if (await auth.refresh(revision)) controller.authenticationRenewed(); }}>Xác thực lại</Button>}</div>}
      <div ref={log} className="advisor-messages" role="log" aria-label="Tin nhắn hội thoại" aria-live={live && isBusy(view.phase) ? 'off' : 'polite'} tabIndex={0} onScroll={event => { const node = event.currentTarget; atEnd.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80; }}>
        {invalidId ? <p role="alert" className="text-base">Đường dẫn hội thoại chưa đúng.</p> : selectedId === null ? <div className="advisor-empty"><LottieIllustration kind="advisor" size={120} /><h2 className="text-xl">Bạn đang phân vân điều gì?</h2><p className="text-base">Chọn câu hỏi gợi ý hoặc viết điều bạn muốn hỏi. Kết nối khi sẵn sàng, hoặc mở một hội thoại cũ để đọc lại.</p></div> : <>
          {messages.isPending ? <p role="status" className="text-sm">Đang tải tin nhắn…</p> : messages.isError && <div role="alert"><p className="text-sm">Chưa tải được tin nhắn của hội thoại này.</p><Button className="text-sm" disabled={messages.isFetching} onClick={() => { void messages.refetch(); }}>Tải lại tin nhắn</Button></div>}
          {saved.map(item => <article className={`advisor-message ${item.role ?? 'unknown'}`} key={item.id} aria-label={`Tin nhắn ${item.role === 'user' ? 'người dùng' : item.role === 'assistant' ? 'AI' : 'chưa xác định vai trò'} #${item.id}`}><p>{item.content || 'Tin nhắn này không có nội dung.'}</p></article>)}
          {messages.isSuccess && !saved.length && !turn && <p className="advisor-caption text-xs">Chưa có tin nhắn nào ở đây.</p>}
          {showTurn && <>{!storedUser && <article className="advisor-message user" aria-label="Câu hỏi đang gửi"><p>{turn.question}</p></article>}{turn.answer && <article className="advisor-message assistant" aria-label="Câu trả lời chưa xác nhận lưu"><p>{turn.answer}</p><span className="advisor-caption text-xs">{view.phase === 'completed' ? 'Đang kiểm tra nội dung đã lưu…' : 'Nội dung tạm, chưa xác nhận đã lưu.'}</span></article>}</>}
          {waitingForReply && <AdvisorReplySkeleton />}
        </>}
      </div>
      <AdvisorComposer key={`${selectedId ?? 'new'}:${invalidId}`} ownerId={ownerId} sessionId={selectedId} live={live && !invalidId} hollandReady={history.isSuccess && history.data.length > 0} view={view} controller={controller} messages={messages} />
    </section>
  </div>;
}
