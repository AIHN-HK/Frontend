export function Pagination({
  page,
  limit,
  total,
  busy,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  busy: boolean;
  onPage: (page: number) => void;
}) {
  const count = Math.max(1, Math.ceil(total / limit));
  return (
    <nav className="admin-actions" aria-label="Phân trang">
      <button className="btn btn-secondary" disabled={busy || page <= 1} onClick={() => onPage(page - 1)}>
        Trang trước
      </button>
      <span>
        Trang {page}/{count}
      </span>
      <button className="btn btn-secondary" disabled={busy || page >= count} onClick={() => onPage(page + 1)}>
        Trang sau
      </button>
      {page > count && (
        <button className="btn btn-secondary" disabled={busy} onClick={() => onPage(1)}>
          Về trang đầu
        </button>
      )}
    </nav>
  );
}
