import { Link, useSearchParams } from "react-router";
import { Button } from "@/shared/ui/Button";
import { usePlatformQuery } from "../api/platform.api";
import { catalogSchema, codes } from "../model/contracts";
import { PlatformFrame, ReadState, SourceNote } from "../components/PlatformUI";
export function CareerCatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "",
    code = params.get("code") ?? "";
  const value = Number(params.get("page")),
    page =
      Number.isSafeInteger(value) && value > 0 && value <= 10000 ? value : 1;
  const query = new URLSearchParams({
    q: q.slice(0, 120),
    page: String(page),
    limit: "12",
  });
  if (codes.some((c) => c === code)) query.set("code", code);
  const result = usePlatformQuery(
    "catalog",
    `/api/v1/careers?${query}`,
    catalogSchema,
  );
  const change = (next: number) => {
    const out = new URLSearchParams(params);
    out.set("page", String(next));
    setParams(out);
  };
  return (
    <PlatformFrame title="Khám phá nghề nghiệp">
      <SourceNote />
      <form
        className="platform-controls"
        role="search"
        key={params.toString()}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setParams(
            new URLSearchParams({
              q: String(data.get("q") ?? "").trim(),
              code: String(data.get("code") ?? ""),
              page: "1",
            }),
          );
        }}
      >
        <label>
          Tìm nghề theo tên hoặc mô tả
          <input name="q" type="search" maxLength={120} defaultValue={q} />
        </label>
        <label>
          Nhóm RIASEC nổi bật
          <select name="code" defaultValue={code}>
            <option value="">Tất cả</option>
            {codes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <Button type="submit">Tìm kiếm</Button>
      </form>
      <ReadState
        pending={result.isPending}
        error={result.isError}
        retry={() => void result.refetch()}
      />
      {result.data && (
        <>
          <p role="status">
            {result.data.total} nghề có nguồn · Trang {page}
          </p>
          {!result.data.items.length ? (
            <p>
              Không có nghề phù hợp trong trang này. Thử từ khóa khác hoặc{" "}
              <Button variant="secondary" onClick={() => setParams({})}>
                Đặt lại bộ lọc
              </Button>
            </p>
          ) : (
            <div className="platform-grid">
              {result.data.items.map((c) => (
                <article className="platform-card" key={c.id}>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                  <p>
                    {c.id} · {c.sourceVersion}
                  </p>
                  <Link to={`/careers/${c.id}`}>Xem chi tiết nghề</Link>
                </article>
              ))}
            </div>
          )}
          <nav className="platform-controls" aria-label="Phân trang nghề">
            <Button
              disabled={page <= 1}
              variant="secondary"
              onClick={() => change(page - 1)}
            >
              Trang trước
            </Button>
            <Button
              disabled={page * result.data.limit >= result.data.total}
              variant="secondary"
              onClick={() => change(page + 1)}
            >
              Trang sau
            </Button>
          </nav>
        </>
      )}
    </PlatformFrame>
  );
}
