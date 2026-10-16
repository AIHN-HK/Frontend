import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAssessmentHistoryQuery } from '@/modules/assessment';
import { useAuth } from '@/modules/auth';
import { session, useSession } from '@/shared/session/session';
import { getEnvironment } from '@/shared/config/env';
import { Button } from '@/shared/ui/Button';
import { paths } from '@/routes/paths';
import advisorMascot from '@/assets/dashboard/aihn-advisor-mascot.svg';
import { createAdvisorController, socketTransport } from '../model/advisor.socket';
import { browserDraftStorage, createAdvisorDraftStore } from '../model/advisor.draft';
import { isBusy, parseSessionId } from '../model/message.types';
import { advisorMessagesKey, useAdvisorQueries } from '../queries/advisor.queries';
import { AdvisorComposer } from '../components/AdvisorComposer';
import { AdvisorReplySkeleton } from '../components/AdvisorReplySkeleton';
import './advisor.css';

export function AdvisorPage() {
  const current = useSession();
  if (!current.user) return null;
  return <AdvisorWorkspace key={`${current.user.id}:${current.revision}`} ownerId={current.user.id} revision={current.revision} />;
}
function AdvisorWorkspace({ ownerId, revision }: { ownerId: number; revision: number }) {
  const [params] = useSearchParams(), rawId = params.get('sessionId'), selectedId = parseSessionId(rawId), invalidId = rawId !== null && selectedId === null;
  const [contextOpen, setContextOpen] = useState(() => window.matchMedia('(min-width: 901px)').matches);
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
  const status = view.authPending ? 'Đang gia hạn xác thực…' : view.phase === 'awaiting' ? 'Đang chờ hệ thống nhận câu hỏi…' : view.phase === 'queued' ? 'Câu hỏi đã vào hàng đợi…' : view.phase === 'streaming' ? 'AIHN đang trả lời…' : view.phase === 'stopping' ? 'Đang yêu cầu dừng trả lời…' : view.phase === 'completed' ? 'Lượt trả lời đã hoàn tất.' : view.connection === 'connecting' ? 'Đang kết nối hội thoại…' : live ? 'Đã kết nối hội thoại.' : 'Chưa kết nối hội thoại mới.';
  return <div className="advisor-page">
    <aside className="advisor-context" aria-label="Ngữ cảnh và lịch sử tư vấn">
      <div className="advisor-heading"><img src={advisorMascot} alt="" width="52" height="52" /><div><h1>Cố vấn AIHN</h1><p className="advisor-caption">Cùng bạn tìm hướng đi</p></div></div>
      <details className="advisor-context-details" open={contextOpen} onToggle={event => setContextOpen(event.currentTarget.open)}><summary>Ngữ cảnh hội thoại</summary><div className="advisor-context-block"><p>Máy chủ chuẩn bị hồ sơ tài khoản và kết quả Holland gắn với phiên tư vấn.</p>{live && view.connected ? <Link className="btn btn-ghost" to={paths.assessmentResult(view.connected.attemptId)}>Xem kết quả của phiên #{view.connected.attemptId}</Link> : <p className="advisor-caption">Chưa xác định kết quả gắn với phiên đang xem.</p>}</div>
      <p className="advisor-caption">Ngữ cảnh nghề, gợi ý nghề cá nhân hóa và trích dẫn nguồn chưa sẵn sàng.</p></details>
      <div className="advisor-session-controls"><label htmlFor="advisor-session">Phiên tư vấn</label><select id="advisor-session" value={selectedId === null ? '' : String(selectedId)} onChange={event => { controller.disconnect(); navigate(event.target.value ? paths.advisorSession(event.target.value) : paths.advisor); }}><option value="">Hội thoại mới</option>{selectedId !== null && !selected && <option value={selectedId}>Phiên #{selectedId}</option>}{sessions.data?.map(item => <option key={item.id} value={item.id}>{item.title?.trim() || `Phiên #${item.id}`} · {item.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}</option>)}</select>
        {sessions.isPending ? <p role="status">Đang tải danh sách phiên…</p> : sessions.isError && <div role="alert"><p>Không tải được danh sách phiên tư vấn.</p><Button variant="secondary" disabled={sessions.isFetching} onClick={() => { void sessions.refetch(); }}>Thử lại danh sách phiên</Button></div>}
        {sessions.isSuccess && !sessions.data.length && <p className="advisor-caption">Chưa có phiên tư vấn đã lưu.</p>}
        <Button variant="secondary" onClick={startNew}>Bắt đầu hội thoại mới</Button><Link className="btn btn-ghost" to={`${paths.history}?kind=chats`}>Xem lịch sử tư vấn</Link>
      </div>
    </aside>
    <section className="advisor-chat" aria-label="Hội thoại với Cố vấn AIHN">
      <header className="advisor-chat-header"><div><h2>{selectedId === null ? 'Hội thoại mới' : selected?.title?.trim() || `Phiên tư vấn #${selectedId}`}</h2><p className="advisor-caption" role="status">{status}</p></div>
        {selectedId === null && !invalidId && <>
          {history.isPending ? <p role="status">Đang kiểm tra kết quả Holland…</p> : history.isError ? <div role="alert"><p>Chưa kiểm tra được điều kiện mở hội thoại.</p><Button variant="secondary" disabled={history.isFetching} onClick={() => { void history.refetch(); }}>Kiểm tra lại kết quả Holland</Button></div> : !history.data.length ? <div><p>Hoàn thành trắc nghiệm Holland để bắt đầu hội thoại mới.</p><Link className="btn btn-secondary" to={paths.assessment}>Làm bài trắc nghiệm</Link></div> : view.connection === 'connecting' ? <p role="status">Đang kết nối hội thoại…</p> : null}
        </>}
        {live && ['queued', 'streaming', 'stopping'].includes(view.phase) && <Button variant="secondary" disabled={view.phase === 'stopping' || view.authPending} onClick={controller.stop}>Dừng trả lời</Button>}
      </header>
      {selectedId !== null && !live && <p className="advisor-readonly">Phiên đã lưu được mở để đọc lại.</p>}
      {view.notice && <div className="advisor-notice" role="alert"><p>{view.notice}</p>{view.connection === 'auth' && <Button variant="secondary" disabled={view.authPending} onClick={async () => { if (await auth.refresh(revision)) controller.authenticationRenewed(); }}>Làm mới xác thực</Button>}</div>}
      <div ref={log} className="advisor-messages" role="log" aria-label="Tin nhắn hội thoại" aria-live={live && isBusy(view.phase) ? 'off' : 'polite'} tabIndex={0} onScroll={event => { const node = event.currentTarget; atEnd.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80; }}>
        {invalidId ? <p role="alert">Mã phiên tư vấn không hợp lệ.</p> : selectedId === null ? <div className="advisor-empty"><h2>Bạn muốn tìm hiểu điều gì?</h2><p>Chọn câu hỏi gợi ý hoặc viết câu hỏi của bạn. Kết nối hội thoại mới khi sẵn sàng, hoặc chọn một phiên đã lưu để đọc lại.</p></div> : <>
          {messages.isPending ? <p role="status">Đang đọc tin nhắn đã lưu…</p> : messages.isError && <div role="alert"><p>Không đọc được tin nhắn của phiên này.</p><Button variant="secondary" disabled={messages.isFetching} onClick={() => { void messages.refetch(); }}>Thử đọc lại tin nhắn</Button></div>}
          {saved.map(item => <article className={`advisor-message ${item.role ?? 'unknown'}`} key={item.id} aria-label={`Tin nhắn ${item.role === 'user' ? 'người dùng' : item.role === 'assistant' ? 'AI' : 'chưa xác định vai trò'} #${item.id}`}><p>{item.content || 'Tin nhắn được lưu không có nội dung.'}</p></article>)}
          {messages.isSuccess && !saved.length && !turn && <p className="advisor-caption">Phiên này chưa có tin nhắn đã lưu.</p>}
          {showTurn && <>{!storedUser && <article className="advisor-message user" aria-label="Câu hỏi đang gửi"><p>{turn.question}</p></article>}{turn.answer && <article className="advisor-message assistant" aria-label="Nội dung trả lời nhận tạm"><p>{turn.answer}</p><span className="advisor-caption">{view.phase === 'completed' ? 'Đang đối chiếu nội dung đã lưu.' : 'Nội dung nhận tạm, chưa xác nhận lưu.'}</span></article>}</>}
          {waitingForReply && <AdvisorReplySkeleton />}
        </>}
      </div>
      <AdvisorComposer key={`${selectedId ?? 'new'}:${invalidId}`} ownerId={ownerId} sessionId={selectedId} live={live && !invalidId} hollandReady={history.isSuccess && history.data.length > 0} view={view} controller={controller} messages={messages} />
    </section>
  </div>;
}
