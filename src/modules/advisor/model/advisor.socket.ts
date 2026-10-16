import { io } from 'socket.io-client';
import type { SessionStore } from '@/shared/session/session.types';
import { isBusy, isPositiveId, isRecord, isTurnIdentity, validQuestion } from './message.types';
import type { AdvisorConnection, AdvisorPhase, AdvisorSnapshot } from './message.types';

export interface AdvisorTransport {
  readonly connected: boolean;
  on(event: string, listener: (payload?: unknown) => void): void;
  emit(event: 'ask' | 'stop_generation' | 'refresh_auth', payload: Record<string, unknown>): void;
  connect(): void;
  close(): void;
  updateAuth(token: string): void;
}
export type AdvisorTransportFactory = (token: string) => AdvisorTransport;
export function socketTransport(origin: string): AdvisorTransportFactory {
  return token => {
    const socket = io(origin, { autoConnect: false, forceNew: true, reconnection: false, transports: ['websocket'], auth: { token }, timeout: 10_000 });
    return {
      get connected() { return socket.connected; },
      on: (event, listener) => { socket.on(event, listener); },
      emit: (event, payload) => { socket.emit(event, payload); },
      connect: () => { socket.connect(); },
      close: () => { socket.removeAllListeners(); socket.disconnect(); },
      updateAuth: next => { socket.auth = { token: next }; },
    };
  };
}
export type AdvisorControllerOptions = {
  ownerId: number; revision: number; session: SessionStore; transport: AdvisorTransportFactory;
  onConnected: (value: AdvisorConnection) => void;
  onOutcome: (phase: AdvisorPhase, sessionId: number, question: string) => void;
};
const retainedQuestion = 'Câu hỏi được giữ để bạn kiểm tra.';
export function createAdvisorController(options: AdvisorControllerOptions) {
  let current: AdvisorSnapshot = { connection: 'idle', connected: null, phase: 'idle', turn: null, authPending: false, notice: null };
  const listeners = new Set<() => void>(), retired = new Set<string>();
  let socket: AdvisorTransport | null = null, generation = 0, mounted = false, accessToken = '', unsubscribe: (() => void) | undefined;
  let connectedDeadline: ReturnType<typeof setTimeout> | undefined;
  let deadline: ReturnType<typeof setTimeout> | undefined, total: ReturnType<typeof setTimeout> | undefined, authDeadline: ReturnType<typeof setTimeout> | undefined;
  let pendingAsk: { question: string; savedIds: readonly number[] } | null = null;
  const early = new Map<string, { event: string; value: unknown }[]>(); let earlySize = 0;
  const owned = () => { const state = options.session.read(); return mounted && state.status === 'authenticated' && state.user?.id === options.ownerId && state.revision === options.revision; };
  const publish = (value: Partial<AdvisorSnapshot>) => { current = { ...current, ...value }; for (const listener of listeners) listener(); };
  function clearTurnTimers() { clearTimeout(deadline); clearTimeout(total); early.clear(); earlySize = 0; }
  function finish(phase: AdvisorPhase, notice: string | null) {
    if (!current.turn || !isBusy(current.phase)) return;
    clearTurnTimers(); if (current.turn.turnId) retired.add(current.turn.turnId);
    publish({ phase, notice }); if (owned()) options.onOutcome(phase, current.turn.sessionId, current.turn.question);
  }
  function turnTimeout(message: string, duration: number) { clearTimeout(deadline); deadline = setTimeout(() => { if (owned()) finish('unknown', `${message} ${retainedQuestion}`); }, duration); }
  function closeSocket(stop: boolean) {
    if (socket && stop && owned() && socket.connected && !current.authPending && current.turn?.turnId && isBusy(current.phase) && current.phase !== 'stopping') socket.emit('stop_generation', { sessionId: current.turn.sessionId });
    generation++; clearTurnTimers(); clearTimeout(authDeadline); clearTimeout(connectedDeadline);
    if (isBusy(current.phase)) finish('unknown', `Chưa xác nhận lượt trả lời khi rời hội thoại. ${retainedQuestion}`);
    socket?.close(); socket = null;
  }
  function terminal(event: string, value: unknown) {
    if (!owned() || !isBusy(current.phase) || !isTurnIdentity(value) || value.sessionId !== current.turn?.sessionId) return;
    if (!current.turn.turnId) {
      if (retired.has(value.turnId)) return;
      const size = typeof value.content === 'string' ? value.content.length : 0;
      if (earlySize + size > 256000 || [...early.values()].reduce((n, frames) => n + frames.length, 0) >= 1000) { finish('unknown', `Luồng trả lời không hợp lệ. ${retainedQuestion}`); return; }
      earlySize += size; const frames = early.get(value.turnId) ?? []; frames.push({ event, value }); early.set(value.turnId, frames); return;
    }
    if (value.turnId !== current.turn.turnId) return;
    if (event === 'answer_token') {
      if (current.phase === 'stopping') return;
      if (typeof value.content !== 'string' || current.turn.answer.length + value.content.length > 256000) { finish('unknown', `Luồng trả lời không hợp lệ. ${retainedQuestion}`); return; }
      publish({ phase: 'streaming', turn: { ...current.turn, answer: current.turn.answer + value.content } }); turnTimeout('Luồng trả lời đã quá thời gian chờ.', 35_000); return;
    }
    if (event === 'generation_stopped' || value.status === 'cancelled') { finish('cancelled', `Đã dừng lượt trả lời. ${retainedQuestion}`); return; }
    if (value.status === 'completed') { finish('completed', null); return; }
    if (value.status === 'failed') { finish('failed', `AI chưa hoàn tất lượt trả lời. ${retainedQuestion}`); return; }
    finish('unknown', `Chưa xác nhận trạng thái trả lời. ${retainedQuestion}`);
  }
  function doAsk(question: string, savedIds: readonly number[]): boolean {
    if (!owned() || !socket?.connected || current.connection !== 'ready' || current.authPending || !current.connected || isBusy(current.phase) || !validQuestion(question)) return false;
    clearTurnTimers(); publish({ phase: 'awaiting', turn: { sessionId: current.connected.sessionId, turnId: null, question, answer: '', savedIds: [...savedIds] }, notice: null });
    if (!owned() || !socket || !current.connected) return false;
    options.onOutcome('awaiting', current.connected.sessionId, question);
    if (!owned() || !socket || !current.connected) return false;
    turnTimeout('Chưa xác nhận hệ thống nhận câu hỏi.', 15_000);
    total = setTimeout(() => { if (owned()) finish('unknown', `Lượt trả lời đã quá thời gian chờ. ${retainedQuestion}`); }, 150_000);
    socket.emit('ask', { sessionId: current.connected.sessionId, content: question }); return true;
  }
  function begin() {
    if (!owned() || socket || current.connection === 'connecting') return false;
    const tokens = options.session.read().tokens; if (!tokens) return false;
    accessToken = tokens.accessToken; const local = ++generation; socket = options.transport(accessToken);
    const active = () => owned() && local === generation;
    publish({ connection: 'connecting', connected: null, phase: 'idle', turn: null, notice: null, authPending: false });
    if (!owned() || !socket) return false;
    connectedDeadline = setTimeout(() => { if (!active() || current.connection !== 'connecting') return; closeSocket(false); publish({ connection: 'disconnected', notice: 'Không xác nhận được kết nối hội thoại. Hãy thử kết nối lại khi sẵn sàng.' }); }, 12_000);
    socket.on('connected', value => {
      if (!active()) return;
      if (!isRecord(value) || !isPositiveId(value.sessionId) || !isPositiveId(value.attemptId) || value.userID !== options.ownerId || (value.title !== null && typeof value.title !== 'string')) {
        clearTimeout(connectedDeadline); closeSocket(false); publish({ connection: 'disconnected', notice: 'Kết nối trả về phiên không hợp lệ.' }); return;
      }
      if (current.connection !== 'connecting') return;
      clearTimeout(connectedDeadline); const connected = { sessionId: value.sessionId, attemptId: value.attemptId, userID: options.ownerId, title: value.title };
      publish({ connection: 'ready', connected }); if (owned()) options.onConnected(connected);
      if (pendingAsk) {
        const { question, savedIds } = pendingAsk; pendingAsk = null;
        // ponytail: microtask so onConnected navigation settles first
        queueMicrotask(() => { doAsk(question, savedIds); });
      }
    });
    socket.on('queue_joined', value => {
      if (!active() || current.phase !== 'awaiting' || !isTurnIdentity(value) || value.sessionId !== current.turn?.sessionId || retired.has(value.turnId)) return;
      publish({ phase: 'queued', turn: { ...current.turn, turnId: value.turnId } }); turnTimeout('Luồng trả lời đã quá thời gian chờ.', 35_000);
      const frames = early.get(value.turnId) ?? []; early.clear(); earlySize = 0; for (const frame of frames) terminal(frame.event, frame.value);
    });
    for (const event of ['answer_token', 'answer_end', 'answer_error', 'generation_stopped']) socket.on(event, value => { if (active()) terminal(event, value); });
    socket.on('auth_refreshed', () => { if (!active()) return; clearTimeout(authDeadline); publish({ connection: 'ready', authPending: false, notice: isBusy(current.phase) ? current.notice : null }); });
    socket.on('error', value => {
      if (!active()) return;
      const auth = isRecord(value) && typeof value.message === 'string' && /authenticat|authentication|renewal|access denied/i.test(value.message);
      finish('failed', `Không xác nhận được lượt trả lời. ${retainedQuestion}`);
      if (auth) { clearTimeout(authDeadline); publish({ connection: 'auth', authPending: false, notice: `Cần làm mới xác thực hội thoại.${current.turn ? ` ${retainedQuestion}` : ''}` }); }
      else publish({ notice: `Không xác nhận được lượt trả lời. ${current.turn ? retainedQuestion : 'Vui lòng thử lại khi sẵn sàng.'}` });
    });
    for (const event of ['disconnect', 'connect_error']) socket.on(event, () => {
      if (!active()) return; const authRejected = current.connection === 'auth'; clearTimeout(connectedDeadline); finish('unknown', `Kết nối hội thoại đã gián đoạn. ${retainedQuestion}`); closeSocket(false);
      publish({ connection: authRejected ? 'auth' : 'disconnected', authPending: false, notice: `${authRejected ? 'Cần làm mới xác thực hội thoại.' : 'Kết nối hội thoại đã gián đoạn.'}${current.turn ? ` ${retainedQuestion}` : ''}` });
    });
    socket.connect(); return true;
  }
  return {
    read: () => current,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    mount: () => {
      mounted = true;
      unsubscribe = options.session.subscribe(() => {
        if (!owned()) { closeSocket(false); publish({ connection: 'disconnected', connected: null, turn: null, phase: 'idle', notice: null, authPending: false }); return; }
        const token = options.session.read().tokens?.accessToken;
        if (!socket || !token || token === accessToken) return;
        accessToken = token; socket.updateAuth(token);
        if (socket.connected && current.connected) {
          publish({ authPending: true }); socket.emit('refresh_auth', { token }); clearTimeout(authDeadline);
          authDeadline = setTimeout(() => { if (!owned() || !current.authPending) return; finish('unknown', `Không xác nhận được gia hạn xác thực. ${retainedQuestion}`); publish({ connection: 'auth', authPending: false, notice: 'Không xác nhận được gia hạn xác thực hội thoại.' }); }, 8_000);
        }
      });
      return () => { closeSocket(true); mounted = false; unsubscribe?.(); unsubscribe = undefined; };
    },
    begin,
    authenticationRenewed: () => { if (owned() && !socket) publish({ connection: 'idle', authPending: false, notice: 'Đã làm mới xác thực. Bạn có thể bắt đầu hội thoại mới khi sẵn sàng.' }); },
    ask: doAsk,
    askOrConnect: (question: string, savedIds: readonly number[] = []) => {
      if (!validQuestion(question)) return false;
      if (current.connection === 'ready' && !current.authPending && current.connected && !isBusy(current.phase)) return doAsk(question, savedIds);
      if (current.connection !== 'idle' && current.connection !== 'disconnected') return false;
      pendingAsk = { question, savedIds };
      return begin();
    },
    stop: () => {
      if (!owned() || !socket?.connected || current.authPending || !current.turn?.turnId || !['queued', 'streaming'].includes(current.phase)) return;
      publish({ phase: 'stopping' }); turnTimeout('Chưa xác nhận dừng trả lời.', 10_000); socket.emit('stop_generation', { sessionId: current.turn.sessionId });
    },
    disconnect: () => { closeSocket(true); publish({ connection: 'idle', connected: null, turn: null, phase: 'idle', notice: null, authPending: false }); },
  };
}
