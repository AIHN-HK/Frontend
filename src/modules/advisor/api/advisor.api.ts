import type { AxiosInstance } from 'axios';
import { ApiError } from '@/shared/api/api-error';
export { readChatSessions as readAdvisorSessions } from '@/modules/history';
export type { ChatSessionSummary } from '@/modules/history';
import { isPositiveId, isRecord } from '../model/message.types';
import type { AdvisorMessage } from '../model/message.types';

export async function readAdvisorMessages(http: AxiosInstance, sessionId: number, signal: AbortSignal): Promise<AdvisorMessage[]> {
  const response = await http.get<unknown>(`/api/v1/chat/sessions/${sessionId}/messages`, { signal });
  const body = response.data;
  if (response.status !== 200 || !isRecord(body) || body.status !== 200 || !Array.isArray(body.data)) throw new ApiError('configuration', 'Tin nhắn không hợp lệ.');
  const seen = new Set<number>();
  return body.data.map((value: unknown): AdvisorMessage => {
    if (!isRecord(value) || !isPositiveId(value.id) || value.sessionId !== sessionId || (value.role !== 'user' && value.role !== 'assistant' && value.role !== null) || typeof value.content !== 'string' || value.content.length > 256000 || typeof value.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt))) throw new ApiError('configuration', 'Tin nhắn không hợp lệ.');
    return { id: value.id, sessionId, role: value.role, content: value.content, createdAt: value.createdAt };
  }).filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
}
