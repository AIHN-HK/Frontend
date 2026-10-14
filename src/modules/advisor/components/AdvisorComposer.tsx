import { useState, useSyncExternalStore } from 'react';
import { Button } from '@/shared/ui/Button';
import { browserDraftStorage, createAdvisorDraftStore } from '../model/advisor.draft';
import { isBusy, validQuestion } from '../model/message.types';
import type { AdvisorSnapshot } from '../model/message.types';
import type { createAdvisorController } from '../model/advisor.socket';
import type { useAdvisorQueries } from '../queries/advisor.queries';
const advisorPrompts = ['Lớp 11 cần chuẩn bị gì cho việc chọn ngành?', 'Em nên tìm hiểu ngành học theo cách nào?', 'Làm sao để chọn tổ hợp môn phù hợp?'];
export function AdvisorComposer({ ownerId, sessionId, live, view, controller, messages }: {
  ownerId: number; sessionId: number | null; live: boolean; view: AdvisorSnapshot;
  controller: ReturnType<typeof createAdvisorController>; messages: ReturnType<typeof useAdvisorQueries>['messages'];
}) {
  const store = createAdvisorDraftStore(ownerId, sessionId, browserDraftStorage()), draft = useSyncExternalStore(store.subscribe, store.read, store.read);
  const [checked, setChecked] = useState(false), busy = live && isBusy(view.phase), historical = sessionId !== null && !live;
  const canWrite = live && view.connection === 'ready' && !view.authPending && !draft.needsReview && !draft.blocked && !busy && messages.isSuccess && !messages.isFetching;
  return <div className="advisor-composer">
    {!historical && <div className="advisor-prompts" aria-label="Gợi ý câu hỏi">{advisorPrompts.map(prompt => <Button key={prompt} variant="ghost" disabled={busy || draft.needsReview || draft.blocked} onClick={() => { store.write(prompt, false); }}>{prompt}</Button>)}</div>}
    {draft.blocked && <div role="alert" className="advisor-notice"><p>Nháp không đọc được hoặc không tương thích. Chưa tự ghi đè nháp.</p><Button variant="secondary" onClick={store.discard}>Bỏ nháp không tương thích</Button></div>}
    {draft.storageFailed && <p className="advisor-caption">Không lưu được nháp trên trình duyệt; câu hỏi chỉ giữ trong màn hiện tại.</p>}
    {draft.needsReview && !busy && <div className="advisor-review">
      {!view.notice && <p role="alert">Chưa xác nhận lượt gửi trước. Câu hỏi được giữ để bạn kiểm tra.</p>}
      <p className="advisor-caption">Đọc lại tin nhắn đã lưu trước khi quyết định gửi một lượt khác. Câu hỏi trước có thể đã được máy chủ nhận.</p>
      <Button variant="secondary" disabled={messages.isFetching || sessionId === null} onClick={async () => { const result = await messages.refetch(); setChecked(result.isSuccess); }}>Đối chiếu lịch sử</Button>
      {checked && live && <Button variant="secondary" onClick={() => { store.write(draft.content, false); setChecked(false); }}>Tôi đã kiểm tra lịch sử</Button>}
    </div>}
    <form onSubmit={event => { event.preventDefault(); const active = store.read(); if (!canWrite || active.needsReview || active.blocked || !validQuestion(active.content)) return; setChecked(false); controller.ask(active.content, messages.data?.map(item => item.id)); }}>
      <label htmlFor="advisor-question">Câu hỏi của bạn</label>
      <textarea id="advisor-question" rows={2} value={draft.content} disabled={historical || busy || draft.blocked} placeholder="Nhập câu hỏi về định hướng ngành học và nghề nghiệp…" onChange={event => { store.write(event.target.value, draft.needsReview); }} onFocus={event => { event.currentTarget.scrollIntoView({ block: 'nearest' }); }} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
      }} />
      {draft.content.length > 8000 && <p className="advisor-caption" role="alert">Câu hỏi tối đa 8000 ký tự.</p>}
      <div className="advisor-composer-actions"><span className="advisor-caption">Enter để gửi · Shift+Enter xuống dòng</span><Button type="submit" disabled={!canWrite || !validQuestion(draft.content)}>Gửi</Button></div>
    </form>
  </div>;
}
