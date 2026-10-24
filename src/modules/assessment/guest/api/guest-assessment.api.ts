import type { AxiosInstance } from 'axios';
import { z } from 'zod';
import { ApiError } from '@/shared/api/api-error';
import { guestCatalogSchema, guestResultSchema } from '../model/guest-assessment';
import type { GuestDraft } from '../model/guest-assessment';

export async function readGuestCatalog(http: AxiosInstance, signal: AbortSignal) {
  const response = await http.get<unknown>('/api/v1/guest-assessment/catalog', { signal });
  const parsed = z.object({ status: z.literal(200), data: guestCatalogSchema }).safeParse(response.data);
  if (!parsed.success) throw new ApiError('configuration', 'Không đọc được bộ đề cho khách.');
  return parsed.data.data;
}
export async function previewGuestAssessment(http: AxiosInstance, draft: GuestDraft, signal: AbortSignal) {
  const answers = draft.catalog.questions.map(q => ({ questionId: q.id, check: draft.answers[String(q.id)] }));
  if (answers.some(a => typeof a.check !== 'boolean') || !answers.some(a => a.check)) throw new ApiError('configuration', 'Hãy trả lời đủ các câu và chọn Có cho ít nhất một hoạt động.');
  const response = await http.post<unknown>('/api/v1/guest-assessment/preview', { catalogToken: draft.catalog.catalogToken, answers }, { signal });
  const parsed = z.object({ status: z.literal(200), data: guestResultSchema }).safeParse(response.data);
  if (!parsed.success || parsed.data.data.id !== draft.catalog.id) throw new ApiError('configuration', 'Chưa xác nhận được tổng kết RIASEC. Đáp án vẫn được giữ.');
  return parsed.data.data;
}
