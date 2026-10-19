import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import { createSessionStore } from '@/shared/session/session';
import { createAdvisorController } from '@/modules/advisor/model/advisor.socket';
import type { AdvisorTransport } from '@/modules/advisor/model/advisor.socket';
import { createAdvisorDraftStore, advisorDraftKey } from '@/modules/advisor/model/advisor.draft';
import { readAdvisorMessages } from '@/modules/advisor/api/advisor.api';
import { parseSessionId } from '@/modules/advisor/model/message.types';
function setup() {
  const session = createSessionStore(); session.establish({ id: 71, fullname: 'A', role: 'USER' }, { accessToken: 'a1', refreshToken: 'r1' });
  const transports: { listeners: Map<string, (data?: unknown) => void>; socket: AdvisorTransport; live: boolean }[] = [];
  const factory = vi.fn(() => {
    const entry = { listeners: new Map<string, (data?: unknown) => void>(), socket: {} as AdvisorTransport, live: false };
    entry.socket = { get connected() { return entry.live; }, on: (name, fn) => { entry.listeners.set(name, fn); }, emit: vi.fn(), connect: vi.fn(() => { entry.live = true; }), close: vi.fn(() => { entry.live = false; entry.listeners.clear(); }), updateAuth: vi.fn() }; transports.push(entry); return entry.socket;
  });
  const outcome = vi.fn(), connected = vi.fn();
  const controller = createAdvisorController({ ownerId: 71, revision: session.read().revision, session, transport: factory, onConnected: connected, onOutcome: outcome });
  const dispose = controller.mount(), event = (name: string, payload?: unknown) => transports.at(-1)?.listeners.get(name)?.(payload);
  const begin = () => { controller.begin(); event('connected', { sessionId: 100, attemptId: 812, userID: 71, title: null }); };
  const queue = () => event('queue_joined', { sessionId: 100, turnId: 't1' });
  return { session, controller, event, begin, queue, dispose, transports, factory, outcome, connected };
}
afterEach(() => { vi.useRealTimers(); });
describe('advisor transport ownership and terminal correlation', () => {
  it('creates no socket on mount, one on explicit connection and rejects blank/oversized/double asks', () => {
    const f = setup(); expect(f.factory).not.toHaveBeenCalled(); f.begin(); f.controller.begin(); expect(f.factory).toHaveBeenCalledTimes(1);
    expect(f.controller.ask('  ')).toBe(false); expect(f.controller.ask('x'.repeat(8001))).toBe(false); expect(f.controller.ask('Câu hỏi')).toBe(true); expect(f.controller.ask('Câu hỏi')).toBe(false);
    expect(f.transports[0]!.socket.emit).toHaveBeenCalledExactlyOnceWith('ask', { sessionId: 100, content: 'Câu hỏi' }); f.dispose();
  });
  it('binds early tokens after queue ack and filters other sessions/turns and duplicate terminals', () => {
    const f = setup(); f.begin(); f.controller.ask('Câu hỏi'); f.event('answer_token', { sessionId: 100, turnId: 't1', content: 'A' }); expect(f.controller.read().turn?.answer).toBe(''); f.queue(); expect(f.controller.read().turn?.answer).toBe('A');
    f.event('answer_token', { sessionId: 21, turnId: 't1', content: 'X' }); f.event('answer_token', { sessionId: 100, turnId: 't2', content: 'Y' }); f.event('answer_end', { sessionId: 100, turnId: 't2', status: 'completed' }); expect(f.controller.read().phase).toBe('streaming');
    f.event('answer_end', { sessionId: 100, turnId: 't1', status: 'failed' }); f.event('answer_error', { sessionId: 100, turnId: 't1', status: 'failed' }); f.event('answer_token', { sessionId: 100, turnId: 't1', content: 'Z' }); expect(f.controller.read().turn?.answer).toBe('A'); expect(f.outcome.mock.calls.map(x => x[0])).toEqual(['awaiting','failed']); f.dispose();
  });
  it('retires completed turn IDs so late old queue/token/end cannot complete a later pending ask', () => {
    const f = setup(); f.begin(); f.controller.ask('First'); f.queue(); f.event('answer_end', { sessionId: 100, turnId: 't1', status: 'completed' }); f.controller.ask('Second', [1, 2]); f.queue(); f.event('answer_token', { sessionId: 100, turnId: 't1', content: 'old' }); f.event('answer_end', { sessionId: 100, turnId: 't1', status: 'completed' }); expect(f.controller.read().phase).toBe('awaiting');
    f.event('queue_joined', { sessionId: 100, turnId: 't2' }); f.event('answer_token', { sessionId: 100, turnId: 't2', content: 'new' }); expect(f.controller.read().turn).toMatchObject({ question: 'Second', answer: 'new', savedIds: [1,2] }); f.dispose();
  });
  it('stop has one command and only matching cancellation acknowledges completion', () => {
    const f = setup(); f.begin(); f.controller.ask('Stop'); f.queue(); f.controller.stop(); f.controller.stop(); expect(f.transports[0]!.socket.emit).toHaveBeenLastCalledWith('stop_generation', { sessionId: 100 }); f.event('generation_stopped', { sessionId: 100, turnId: 'other' }); expect(f.controller.read().phase).toBe('stopping'); f.event('generation_stopped', { sessionId: 100, turnId: 't1' }); expect(f.controller.read().phase).toBe('cancelled'); expect(f.outcome).toHaveBeenLastCalledWith('cancelled', 100, 'Stop'); f.dispose();
  });
  it('token rotation renews the same socket and blocks asks until auth_refreshed; owner change clears view and closes', () => {
    const f = setup(); f.begin(); f.session.rotate({ accessToken: 'a2', refreshToken: 'r2' }, f.session.read().revision); expect(f.factory).toHaveBeenCalledTimes(1); expect(f.transports[0]!.socket.emit).toHaveBeenLastCalledWith('refresh_auth', { token: 'a2' }); expect(f.controller.ask('wait')).toBe(false); f.event('auth_refreshed'); expect(f.controller.ask('Now')).toBe(true);
    f.session.establish({ id: 72, fullname: 'B', role: 'USER' }, { accessToken: 'b', refreshToken: 'br' }); expect(f.transports[0]!.socket.close).toHaveBeenCalledTimes(1); expect(f.controller.read().turn).toBeNull(); expect(f.controller.read().connected).toBeNull(); expect(f.controller.ask('No')).toBe(false); f.dispose();
  });
  it('queue/stream/stop/connect deadlines release busy state without mutation replay', () => {
    vi.useFakeTimers(); const f = setup(); f.begin(); f.controller.ask('Unknown'); vi.advanceTimersByTime(15_001); expect(f.controller.read().phase).toBe('unknown'); expect(f.outcome).toHaveBeenLastCalledWith('unknown',100,'Unknown'); expect(f.transports[0]!.socket.emit).toHaveBeenCalledTimes(1); f.dispose(); expect(vi.getTimerCount()).toBe(0);
    for (const stop of [false,true]) { const run = setup(); run.begin(); run.controller.ask('Unknown'); run.queue(); if (stop) run.controller.stop(); vi.advanceTimersByTime(stop ? 10_001 : 35_001); expect(run.controller.read().phase).toBe('unknown'); run.dispose(); expect(vi.getTimerCount()).toBe(0); }
    const connection = setup(); connection.controller.begin(); vi.advanceTimersByTime(12_001); expect(connection.controller.read().connection).toBe('disconnected'); connection.dispose(); expect(vi.getTimerCount()).toBe(0);
  });
  it('cleanup stops only the acknowledged current turn, removes handlers/timers and never auto-reconnects', () => {
    vi.useFakeTimers(); const f = setup(); f.begin(); f.controller.ask('Running'); f.queue(); const late = f.transports[0]!.listeners.get('answer_token')!; f.dispose(); late({ sessionId:100,turnId:'t1',content:'late' }); expect(f.controller.read().turn?.answer).toBe(''); expect(f.transports[0]!.socket.emit).toHaveBeenLastCalledWith('stop_generation', { sessionId:100 }); expect(f.transports[0]!.listeners.size).toBe(0); expect(vi.getTimerCount()).toBe(0); vi.advanceTimersByTime(200_000); expect(f.factory).toHaveBeenCalledTimes(1);
  });
  it('rejects a connected owner mismatch and malformed token content without exposing data', () => {
    const f = setup(); f.controller.begin(); f.event('connected', { sessionId:100,attemptId:812,userID:72,title:'Private' }); expect(f.connected).not.toHaveBeenCalled(); expect(f.controller.read().connected).toBeNull(); f.dispose();
    const run = setup(); run.begin(); run.controller.ask('Protocol'); run.queue(); run.event('answer_token', {sessionId:100,turnId:'t1',content:{unsafe:true}}); expect(run.controller.read().phase).toBe('unknown'); expect(run.controller.read().turn?.answer).toBe(''); run.dispose();
  });
});
describe('advisor persistence and REST boundary', () => {
  it('keeps failed questions owner/session/version scoped and clears only explicit confirmation', () => {
    const values = new Map<string,string>(), storage = { getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);},removeItem:(key:string)=>{values.delete(key);} };
    const draft = createAdvisorDraftStore(9001,100,storage); draft.write('Unknown',true); expect(JSON.parse(values.get(advisorDraftKey(9001,100))!)).toMatchObject({ownerId:9001,sessionId:100,content:'Unknown',needsReview:true}); expect(createAdvisorDraftStore(9002,100,storage).read().content).toBe(''); expect(createAdvisorDraftStore(9001,101,storage).read().content).toBe(''); draft.write('',false); expect(values.has(advisorDraftKey(9001,100))).toBe(false);
  });
  it('restores review-required drafts and preserves corrupt/foreign versions until explicit discard', () => {
    const raw = (ownerId:number,version:number)=>({getItem:()=>JSON.stringify({version,ownerId,sessionId:100,content:'Preserved',needsReview:true}),setItem:vi.fn(),removeItem:vi.fn()});
    expect(createAdvisorDraftStore(9003,100,raw(9003,1)).read()).toMatchObject({content:'Preserved',needsReview:true});
    const storage = raw(9004,2), draft = createAdvisorDraftStore(9004,100,storage); expect(draft.read().blocked).toBe(true); expect(draft.write('Overwrite',false)).toBe(false); expect(storage.setItem).not.toHaveBeenCalled(); draft.discard(); expect(draft.read().blocked).toBe(false);
  });
  it('storage denial retains question in memory and reports persistence failure', () => {
    const storage={getItem:()=>null,setItem:()=>{throw new Error('denied');},removeItem:()=>{throw new Error('denied');}};const draft=createAdvisorDraftStore(9005,100,storage);draft.write('Keep',true);expect(draft.read()).toMatchObject({content:'Keep',needsReview:true,storageFailed:true});
  });
  it('validates message identity/roles and deduplicates while preserving authoritative source order', async () => {
    const item={id:1,sessionId:21,content:'<script>not HTML</script>',role:null,createdAt:'2026-10-14T07:00:00Z'};
    const http=(data:unknown)=>({get:vi.fn().mockResolvedValue({status:200,data:{status:200,data}})}) as unknown as AxiosInstance, signal=new AbortController().signal;
    await expect(readAdvisorMessages(http([item,item]),21,signal)).resolves.toEqual([item]);
    for(const bad of [{...item,sessionId:100},{...item,role:'admin'},{...item,id:0},{...item,content:{}},{...item,createdAt:'invalid'}])await expect(readAdvisorMessages(http([bad]),21,signal)).rejects.toThrow();
    for(const value of ['', '0', '-1', '1abc', '1.5', '9007199254740992'])expect(parseSessionId(value)).toBeNull();expect(parseSessionId('21')).toBe(21);
  });
});
