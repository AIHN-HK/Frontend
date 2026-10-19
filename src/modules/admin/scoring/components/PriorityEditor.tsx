import { useState } from 'react';
import { z } from 'zod';
import { useAdminDraft } from '../../model/useAdminDraft';
import { useAdminCommand } from '../../api/useAdminCommand';
import { prioritiesSchema, priorityItem } from '../model/scoring.schema';
export function PriorityEditor({
  initial,
  reload,
}: {
  initial: z.infer<typeof prioritiesSchema>;
  reload: () => Promise<boolean>;
}) {
  const draft = useAdminDraft('priorities', z.array(priorityItem).length(6), initial),
    command = useAdminCommand(),
    [error, setError] = useState(''),
    [notice, setNotice] = useState('');
  return (
    <section className="admin-panel">
      <h2>Ưu tiên khi đồng điểm</h2>
      <p>
        Máy chủ lưu nguyên bộ sáu nhóm trong một giao dịch. Đối chiếu trước khi lưu; thay đổi ảnh hưởng kết
        quả mới.
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (draft.review || command.busy) return;
          const parsed = prioritiesSchema.safeParse(draft.input);
          if (!parsed.success) {
            setError('Cần đủ sáu nhóm với thứ tự duy nhất từ 1 đến 6.');
            return;
          }
          draft.setReview(true);
          setNotice('');
          setError('');
          try {
            await command.send(
              'PUT',
              '/api/v1/admin/priorities',
              { priorities: parsed.data },
              prioritiesSchema.refine(
                (saved) =>
                  saved.every(
                    (row) => parsed.data.find((input) => input.type === row.type)?.priority === row.priority,
                  ),
                'Unexpected priority order',
              ),
            );
            draft.replace(parsed.data);
            setNotice('Đã lưu thứ tự ưu tiên.');
            await reload();
          } catch {
            setError(
              'Chưa xác nhận thứ tự ưu tiên đã lưu. Bản nháp được giữ; đọc dữ liệu hiện tại để đối chiếu.',
            );
          }
        }}
      >
        <div className="admin-form-grid">
          {draft.input.map((row, i) => (
            <label key={row.type}>
              Ưu tiên {row.type}
              <select
                aria-label={`Ưu tiên ${row.type}`}
                disabled={command.busy}
                value={row.priority}
                onChange={(e) =>
                  draft.edit(
                    draft.input.map((item, j) =>
                      i === j ? { ...item, priority: Number(e.target.value) } : item,
                    ),
                  )
                }
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {!draft.stored && <p role="alert">Không lưu được bản nháp trên thiết bị.</p>}
        {draft.review && (
          <>
            <p>
              Thứ tự máy chủ đang đọc:{' '}
              {initial
                .slice()
                .sort((a, b) => a.priority - b.priority)
                .map((r) => r.type)
                .join(' → ')}
              . Đối chiếu với lựa chọn của bạn trước khi gửi lại.
            </p>
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
              Đọc dữ liệu hiện tại để đối chiếu
            </button>
          </>
        )}
        <button className="btn btn-primary" disabled={draft.review || command.busy}>
          Lưu thứ tự ưu tiên
        </button>
      </form>
    </section>
  );
}
