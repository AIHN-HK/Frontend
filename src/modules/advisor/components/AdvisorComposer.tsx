import { useState, useSyncExternalStore } from 'react';
import { Button, Input } from 'antd';
import { browserDraftStorage, createAdvisorDraftStore } from '../model/advisor.draft';
import { isBusy, validQuestion } from '../model/message.types';
import type { AdvisorSnapshot } from '../model/message.types';
import type { createAdvisorController } from '../model/advisor.socket';
import type { useAdvisorQueries } from '../queries/advisor.queries';
const advisorPrompts = ['Lớp 11 nên chuẩn bị gì để chọn ngành?', 'Nên tìm hiểu một ngành học từ đâu?', 'Chọn tổ hợp môn thế nào cho phù hợp?'];
export function AdvisorComposer({ ownerId, sessionId, live, hollandReady, view, controller, messages }: {
  ownerId: number; sessionId: number | null; live: boolean; hollandReady: boolean; view: AdvisorSnapshot;
  controller: ReturnType<typeof createAdvisorController>; messages: ReturnType<typeof useAdvisorQueries>['messages'];
}) {
  const store = createAdvisorDraftStore(ownerId, sessionId, browserDraftStorage()), draft = useSyncExternalStore(store.subscribe, store.read, store.read);
  const [checked, setChecked] = useState(false), busy = live && isBusy(view.phase), historical = sessionId !== null && !live;
  const canWrite = !view.authPending && !draft.needsReview && !draft.blocked && !busy && (live ? view.connection === 'ready' && messages.isSuccess && !messages.isFetching : sessionId === null && hollandReady && (view.connection === 'idle' || view.connection === 'disconnected'));
  return <div className="advisor-composer">
    {!historical && <div className="advisor-prompts" aria-label="Gợi ý câu hỏi">{advisorPrompts.map(prompt => <Button key={prompt} className="text-sm" disabled={busy || draft.needsReview || draft.blocked} onClick={() => { store.write(prompt, false); }}>{prompt}</Button>)}</div>}
    {draft.blocked && <div role="alert" className="advisor-notice text-sm"><p>Chưa đọc được bản nháp. Nội dung cũ vẫn được giữ.</p><Button className="text-sm" onClick={store.discard}>Bỏ bản nháp cũ</Button></div>}
    {draft.storageFailed && <p className="advisor-caption text-xs">Chưa lưu được bản nháp. Giữ trang mở để tránh mất câu hỏi.</p>}
    {draft.needsReview && !busy && <div className="advisor-review text-sm">
      {!view.notice && <p role="alert">Chưa xác nhận đã gửi câu hỏi. Nội dung vẫn được giữ để kiểm tra.</p>}
      <p className="advisor-caption text-xs">Câu hỏi trước có thể đã được nhận. Kiểm tra tin nhắn đã lưu trước khi gửi tiếp.</p>
      <Button className="text-sm" disabled={messages.isFetching || sessionId === null} onClick={async () => { const result = await messages.refetch(); setChecked(result.isSuccess); }}>Kiểm tra lịch sử</Button>
      {checked && live && <Button className="text-sm" onClick={() => { store.write(draft.content, false); setChecked(false); }}>Đã kiểm tra lịch sử</Button>}
    </div>}
    <form onSubmit={event => { event.preventDefault(); const active = store.read(); if (!canWrite || active.needsReview || active.blocked || !validQuestion(active.content)) return; setChecked(false); store.write('', false); controller.askOrConnect(active.content, messages.data?.map(item => item.id) ?? []); }}>
      <label htmlFor="advisor-question" className="text-sm">Câu hỏi của bạn</label>
      <Input.TextArea id="advisor-question" rows={2} value={draft.content} disabled={historical || busy || draft.blocked} placeholder="Viết điều bạn muốn hỏi về học tập hoặc chọn nghề…" onChange={event => { store.write(event.target.value, draft.needsReview); }} onFocus={event => { event.currentTarget.scrollIntoView({ block: 'nearest' }); }} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); }
      }} />
      {draft.content.length > 8000 && <p className="advisor-caption text-xs" role="alert">Tối đa 8.000 ký tự.</p>}
      <div className="advisor-composer-actions"><span className="advisor-caption text-xs">Enter để gửi · Shift+Enter xuống dòng</span><Button htmlType="submit" className="text-base" disabled={!canWrite || !validQuestion(draft.content)}>Gửi</Button></div>
    </form>
  </div>;
}
