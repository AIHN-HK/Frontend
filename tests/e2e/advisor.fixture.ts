import type { Page, WebSocketRoute } from '@playwright/test';
export type AdvisorOptions = { authenticated?: boolean; owner?: number; assessment?: boolean; sessionsStatus?: number; messagesStatus?: number; sessions?: unknown; messages?: unknown; messagesGate?: Promise<void>; mode?: 'complete' | 'hold' | 'failed' | 'silent' | 'early' | 'waiting'; connectedOwner?: number; connectGate?: Promise<void>; long?: boolean };
export async function advisorFixture(page: Page, options: AdvisorOptions = {}) {
  const requests: { path: string; method: string }[] = [], commands: { event: string; data: Record<string, unknown> }[] = [], sockets: WebSocketRoute[] = [], handshakes: { token: string }[] = [], closed: number[] = [];
  const stored = new Map<number, unknown[]>(), sessions = [{ id: 21, title: 'Phiên tư vấn đã lưu', status: 'CLOSED', createdAt: '2026-10-13T07:00:00.000Z' }];
  stored.set(21, [{ id: 1, sessionId: 21, content: options.long ? 'Câu hỏi đã lưu rất dài '.repeat(100) : 'Câu hỏi đã lưu', role: 'user', createdAt: '2026-10-13T07:00:01Z', checkpoint: 1 }, { id: 2, sessionId: 21, content: options.long ? 'Nội dung AI đã lưu rất dài '.repeat(180) : 'Câu trả lời đã lưu từ máy chủ.', role: 'assistant', createdAt: '2026-10-13T07:00:02Z', checkpoint: 0 }]);
  let nextSession = 100, nextMessage = 3, turn = 0;
  const emit = (event: string, data: unknown, index = sockets.length - 1) => { try { sockets[index]?.send(`42${JSON.stringify([event, data])}`); } catch { /* closed fixture socket */ } };
  if (options.authenticated !== false) await page.addInitScript(() => { if (!sessionStorage.getItem('advisor.fixture.initialized')) { sessionStorage.setItem('advisor.fixture.initialized', 'true'); sessionStorage.setItem('aihn.auth.v1', JSON.stringify({ version: 1, ownerId: 71, rememberMe: false, tokens: { accessToken: 'access', refreshToken: 'refresh' } })); } });
  await page.route('http://localhost:3000/api/v1/**', async route => {
    const request = route.request(), path = new URL(request.url()).pathname, method = request.method(), headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': '*' };
    if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; } requests.push({ path, method });
    const owner = options.owner ?? 71; let status = 200, data: unknown = { id: owner, fullname: `Học sinh ${owner}`, role: 'USER' };
    if (path.endsWith('/login')) data = { user: data, accessToken: 'next-access', refreshToken: 'next-refresh' };
    if (path.endsWith('/refresh')) data = { accessToken: 'rotated-access', refreshToken: 'rotated-refresh' };
    if (path.endsWith('/history-by-user')) data = { formattedHistory: options.assessment === false ? [] : [{ attemptId: 812, finishAt: '14/10/2026', analyzeType: 'NORMAL', primaryAnalyze: null }], pageInfo: { hasNext: false, nextCursor: null } };
    if (path.endsWith('/chat/sessions')) { status = options.sessionsStatus ?? 200; data = options.sessions ?? (owner === 71 ? [...sessions].reverse() : []); }
    if (/\/chat\/sessions\/\d+\/messages$/.test(path)) { const id = Number(path.split('/').at(-2)), captured = options.messages ?? stored.get(id) ?? []; await options.messagesGate; status = options.messagesStatus ?? (owner === 71 && stored.has(id) ? 200 : 403); data = captured; }
    if (path.endsWith('/me')) data = { fullname: `Học sinh ${owner}`, phone: null, address: null, gender: null, class: null, email: 'a@example.test' };
    try { await route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify({ status, data }) }); } catch { /* cancelled query */ }
  });
  await page.routeWebSocket('ws://localhost:3000/socket.io/**', ws => {
    const index = sockets.length; sockets.push(ws); const sessionId = nextSession++; let activeTurn = '';
    ws.send(`0${JSON.stringify({ sid: `engine-${index}`, upgrades: [], pingInterval: 100000, pingTimeout: 100000, maxPayload: 1000000 })}`);
    ws.onClose(() => { if (!closed.includes(index)) closed.push(index); });
    ws.onMessage(async raw => {
      const frame = String(raw);
      if (frame.startsWith('40')) {
        handshakes.push(JSON.parse(frame.slice(2)) as { token: string }); ws.send(`40${JSON.stringify({ sid: `socket-${index}` })}`); await options.connectGate;
        sessions.push({ id: sessionId, title: 'Cuộc trò chuyện mới', status: 'ACTIVE', createdAt: '2026-10-14T07:00:00Z' }); stored.set(sessionId, []);
        emit('connected', { sessionId, userID: options.connectedOwner ?? options.owner ?? 71, attemptId: 812, title: 'Cuộc trò chuyện mới' }, index); return;
      }
      if (!frame.startsWith('42')) return; const [event, data] = JSON.parse(frame.slice(2)) as [string, Record<string, unknown>]; commands.push({ event, data });
      if (event === 'refresh_auth') { emit('auth_refreshed', undefined, index); return; }
      if (event === 'ask') {
        activeTurn = `turn-${++turn}`; const content = String(data.content), entries = stored.get(sessionId)!; entries.push({ id: nextMessage++, sessionId, content, role: 'user', createdAt: '2026-10-14T07:00:01Z', checkpoint: 0 });
        if (options.mode === 'silent') return;
        if (options.mode === 'early') emit('answer_token', { sessionId, turnId: activeTurn, content: 'Trả lời ' }, index);
        emit('queue_joined', { sessionId, turnId: activeTurn, message: 'Đang xử lý' }, index);
        if (options.mode === 'waiting') return;
        if (options.mode === 'failed') { const failure = { sessionId, turnId: activeTurn, status: 'failed', code: 'AI_CONNECTION_FAILED', message: 'AI connection failed.' }; emit('answer_end', failure, index); emit('answer_error', failure, index); return; }
        if (options.mode !== 'early') emit('answer_token', { sessionId, turnId: activeTurn, content: 'Trả lời ' }, index);
        if (options.mode === 'hold') return;
        emit('answer_token', { sessionId, turnId: activeTurn, content: 'từ máy chủ.' }, index); entries.push({ id: nextMessage++, sessionId, content: 'Trả lời từ máy chủ.', role: 'assistant', createdAt: '2026-10-14T07:00:02Z', checkpoint: 0 });
        emit('answer_end', { sessionId, turnId: activeTurn, status: 'completed' }, index);
      }
      if (event === 'stop_generation') emit('generation_stopped', { sessionId, turnId: activeTurn }, index);
    });
  });
  return { requests, commands, sockets, handshakes, closed, emit, stored, sessions, current: () => ({ sessionId: nextSession - 1, turnId: `turn-${turn}` }) };
}
