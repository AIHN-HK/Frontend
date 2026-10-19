export type AdvisorMessage = { id: number; sessionId: number; role: 'user' | 'assistant' | null; content: string; createdAt: string };
export type AdvisorConnection = { sessionId: number; attemptId: number; userID: number; title: string | null };
export type TurnIdentity = { sessionId: number; turnId: string };
export type AdvisorPhase = 'idle' | 'awaiting' | 'queued' | 'streaming' | 'stopping' | 'completed' | 'failed' | 'cancelled' | 'unknown';
export type AdvisorTurn = { sessionId: number; turnId: string | null; question: string; answer: string; savedIds: readonly number[] };
export type AdvisorSnapshot = {
  connection: 'idle' | 'connecting' | 'ready' | 'disconnected' | 'auth';
  connected: AdvisorConnection | null;
  phase: AdvisorPhase;
  turn: AdvisorTurn | null;
  authPending: boolean;
  notice: string | null;
};
export function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
export function isPositiveId(value: unknown): value is number { return typeof value === 'number' && Number.isSafeInteger(value) && value > 0; }
export function parseSessionId(value: string | null): number | null {
  return value !== null && /^[1-9]\d*$/.test(value) && isPositiveId(Number(value)) ? Number(value) : null;
}
export function isTurnIdentity(value: unknown): value is TurnIdentity & Record<string, unknown> {
  return isRecord(value) && isPositiveId(value.sessionId) && typeof value.turnId === 'string' && value.turnId.length > 0 && value.turnId.length <= 200;
}
export function isBusy(phase: AdvisorPhase): boolean { return ['awaiting', 'queued', 'streaming', 'stopping'].includes(phase); }
export function validQuestion(content: string): boolean { return Boolean(content.trim()) && content.length <= 8000; }
