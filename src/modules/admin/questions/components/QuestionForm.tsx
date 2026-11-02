import { useState } from 'react';
import { z } from 'zod';
import { ApiError } from '@/shared/api/api-error';
import { useAdminDraft } from '../../model/useAdminDraft';
import { useAdminCommand } from '../../api/useAdminCommand';
import {
  questionInputSchema,
  questionDraftSchema,
  questionRecordSchema,
  type QuestionRecord,
} from '../model/question.schema';
export function QuestionForm({
  item,
  locked,
  reload,
}: {
  item: QuestionRecord | null;
  locked: boolean;
  reload: () => Promise<boolean>;
}) {
  const initial = {
      content: item?.content ?? '',
      type: item?.type ?? ('R' as const),
      dimension: item?.dimension ?? ('INTEREST' as const),
    },
    draft = useAdminDraft(`question.${item?.id ?? 'new'}`, questionDraftSchema, initial),
    command = useAdminCommand(),
    [notice, setNotice] = useState(''),
    [error, setError] = useState('');
  return (
    <section className="admin-panel">
      <h2>{item ? `Sửa câu hỏi #${item.id}` : 'Câu hỏi mới'}</h2>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (command.busy || draft.review || locked) return;
          const parsed = questionInputSchema.safeParse(draft.input);
          if (!parsed.success) {
            setError('Nhập 1–2.000 ký tự, chọn nhóm và khía cạnh.');
            return;
          }
          setError('');
          setNotice('');
          draft.setReview(true);
          try {
            await command.send<unknown>(
              item ? 'PATCH' : 'POST',
              item ? `/api/v1/question/${item.id}` : '/api/v1/question',
              parsed.data,
              item
                ? questionRecordSchema.refine((record) => record.id === item.id, 'Unexpected question ID')
                : z.object({ data: questionRecordSchema }),
            );
            draft.replace(item ? parsed.data : initial);
            setNotice('Đã lưu câu hỏi.');
            await reload();
          } catch (err) {
            const conflict = err instanceof ApiError && err.status === 409;
            setError(
              conflict
                ? 'Câu hỏi bị khóa hoặc vừa thay đổi. Bản nháp vẫn còn. Tải dữ liệu mới để đối chiếu.'
                : 'Chưa xác nhận đã lưu câu hỏi. Bản nháp vẫn còn. Kiểm tra dữ liệu mới trước khi thử lại.',
            );
          }
        }}
      >
        <label>
          Nội dung câu hỏi
          <textarea
            required
            maxLength={2000}
            value={draft.input.content}
            disabled={command.busy}
            onChange={(e) => draft.edit({ ...draft.input, content: e.target.value })}
          />
        </label>
        <div className="admin-form-grid">
          <label>
            Nhóm RIASEC
            <select
              value={draft.input.type}
              disabled={command.busy}
              onChange={(e) =>
                draft.edit({ ...draft.input, type: questionInputSchema.shape.type.parse(e.target.value) })
              }
            >
              {['R', 'I', 'A', 'S', 'E', 'C'].map((code) => (
                <option key={code}>{code}</option>
              ))}
            </select>
          </label>
          <label>
            Khía cạnh
            <select
              value={draft.input.dimension}
              disabled={command.busy}
              onChange={(e) =>
                draft.edit({
                  ...draft.input,
                  dimension: questionInputSchema.shape.dimension.parse(e.target.value),
                })
              }
            >
              <option value="PERSONA">Tôi là người</option>
              <option value="ABILITY">Tôi có thể</option>
              <option value="INTEREST">Tôi thích</option>
            </select>
          </label>
        </div>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {!draft.stored && (
          <p role="alert">Chưa lưu được bản nháp. Giữ trang mở để tránh mất nội dung.</p>
        )}
        {draft.review && (
          <>
            <p>Tải lại dữ liệu và đối chiếu bản nháp trước khi lưu tiếp.</p>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={command.busy}
              onClick={async () => {
                if (await reload()) {
                  draft.setReview(false);
                  setError('');
                }
              }}
            >
              Tải dữ liệu để đối chiếu
            </button>
          </>
        )}
        <button className="btn btn-primary" disabled={locked || draft.review || command.busy}>
          Lưu câu hỏi
        </button>
      </form>
    </section>
  );
}
