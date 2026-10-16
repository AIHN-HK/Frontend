import { useState } from 'react';
import { useAdminDraft } from '../../model/useAdminDraft';
import { useAdminCommand } from '../../api/useAdminCommand';
import { contentDraftSchema, contentSchema, type ContentRecord } from '../model/scoring.schema';
export function ContentEditor({ record, reload }: { record: ContentRecord; reload: () => Promise<boolean> }) {
  const initial = {
      title: record.title,
      personality: record.personality.join('\n'),
      strengths: record.strengths.join('\n'),
      weaknesses: record.weaknesses.join('\n'),
      careers: record.careers.join('\n'),
    },
    draft = useAdminDraft(`topcode.${record.code}`, contentDraftSchema, initial),
    command = useAdminCommand(),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    labels = {
      personality: 'Tính cách',
      strengths: 'Điểm mạnh',
      weaknesses: 'Điểm cần cải thiện',
      careers: 'Nghề tham khảo',
    };
  return (
    <section className="admin-panel">
      <h2>Nội dung nhóm {record.code}</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (command.busy || draft.review) return;
          const parsed = contentSchema.safeParse({
            code: record.code,
            title: draft.input.title,
            ...Object.fromEntries(
              Object.keys(labels).map((key) => [
                key,
                draft.input[key as keyof typeof labels]
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean),
              ]),
            ),
          });
          if (!parsed.success) {
            setError('Nhập tiêu đề và ít nhất một dòng cho mỗi mục.');
            return;
          }
          setError('');
          setNotice('');
          draft.setReview(true);
          try {
            await command.send(
              'PUT',
              '/api/v1/topcode',
              parsed.data,
              contentSchema.refine((saved) => saved.code === record.code, 'Unexpected Holland code'),
            );
            draft.setReview(false);
            setNotice('Đã lưu nội dung Holland.');
            await reload();
          } catch {
            setError('Chưa xác nhận nội dung đã lưu. Bản nháp được giữ; đọc dữ liệu hiện tại để đối chiếu.');
          }
        }}
      >
        <label>
          Tiêu đề nhóm
          <input
            value={draft.input.title}
            required
            disabled={command.busy}
            onChange={(e) => draft.edit({ ...draft.input, title: e.target.value })}
          />
        </label>
        <p>
          Mỗi dòng là một mục văn bản. Nghề tham khảo không phải danh mục nghề đã xuất bản hay khuyến nghị cá
          nhân.
        </p>
        {Object.entries(labels).map(([key, label]) => (
          <label key={key}>
            {label}
            <textarea
              required
              disabled={command.busy}
              value={draft.input[key as keyof typeof labels]}
              onChange={(e) => draft.edit({ ...draft.input, [key]: e.target.value })}
            />
          </label>
        ))}
        {error && <p role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {draft.review && (
          <>
            <details>
              <summary>Nội dung máy chủ lần đọc gần nhất</summary>
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {JSON.stringify(record, null, 2)}
              </pre>
            </details>
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
          Lưu nội dung Holland
        </button>
      </form>
    </section>
  );
}
