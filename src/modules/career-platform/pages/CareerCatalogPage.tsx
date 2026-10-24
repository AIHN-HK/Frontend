import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button, Input, Select } from "antd";
import { usePlatformQuery } from "../api/platform.api";
import { catalogSchema, codes } from "../model/contracts";
import { PlatformFrame, SourceNote } from "../components/PlatformUI";
import styles from "./CareerCatalogPage.module.css";

const groups = ["Thực tế", "Nghiên cứu", "Nghệ thuật", "Xã hội", "Quản lý", "Nghiệp vụ"];

function CatalogSearch({ q, code, apply }: {
  q: string;
  code: string;
  apply(q: string, code: string): void;
}) {
  const [group, setGroup] = useState(code);
  return (
    <form className={styles.search} role="search" onSubmit={(event) => {
      event.preventDefault();
      apply(String(new FormData(event.currentTarget).get("q") ?? "").trim(), group);
    }}>
      <label className={styles.keyword}>
        Tìm nghề theo tên hoặc mô tả
        <Input name="q" type="search" maxLength={120} defaultValue={q} placeholder="Tìm nghề nghiệp…" />
      </label>
      <div className={styles.group}>
        <label htmlFor="catalog-group">Nhóm RIASEC nổi bật</label>
        <Select id="catalog-group" value={group} onChange={setGroup}
          getPopupContainer={(trigger) => trigger.parentElement!}
          options={[{ value: "", label: "Tất cả" }, ...codes.map((c, index) => ({ value: c, label: `${c} · ${groups[index]}` }))]} />
      </div>
      <Button htmlType="submit" type="primary">Tìm kiếm</Button>
    </form>
  );
}

export function CareerCatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").slice(0, 120);
  const rawCode = params.get("code") ?? "";
  const code = codes.some((c) => c === rawCode) ? rawCode : "";
  const value = Number(params.get("page"));
  const page = Number.isSafeInteger(value) && value > 0 && value <= 10000 ? value : 1;
  const query = new URLSearchParams({ q, page: String(page), limit: "12" });
  if (code) query.set("code", code);
  const result = usePlatformQuery("catalog", `/api/v1/careers?${query}`, catalogSchema);
  const change = (next: number) => {
    const out = new URLSearchParams(params);
    out.set("page", String(next));
    setParams(out);
  };
  const data = result.isError ? undefined : result.data;
  return (
    <PlatformFrame title="Khám phá nghề nghiệp" className={styles.page} showTitle={false}
      animationKey={data ? query.toString() : "pending"}>
      <header data-ce-enter="">
        <p className={styles.eyebrow}>DANH MỤC NGHỀ · O*NET</p>
        <h1>Khám phá nghề nghiệp</h1>
        <p>Lọc theo 6 nhóm Holland RIASEC để khám phá đặc điểm và kỹ năng của từng nghề.</p>
      </header>
      <div className={styles.stats} aria-label="Thông tin danh mục">
        <div><strong>{data ? data.total.toLocaleString("vi-VN") : "—"}</strong><span>Nghề trong kết quả</span></div>
        <div><strong>{codes.length}</strong><span>Nhóm RIASEC</span></div>
        <div><strong>O*NET</strong><span>Nguồn nghề tại Mỹ</span></div>
      </div>
      <CatalogSearch key={`${q}:${code}`} q={q} code={code} apply={(keyword, group) => {
        setParams(new URLSearchParams({ q: keyword, code: group, page: "1" }));
      }} />
      {result.isPending && <p role="status">Đang tải dữ liệu nghề…</p>}
      {result.isError && <div className={styles.state} role="alert">
        <p>Không tải được dữ liệu nghề. Hãy kiểm tra kết nối và thử lại.</p>
        <Button onClick={() => void result.refetch()}>Thử tải lại dữ liệu nghề</Button>
      </div>}
      {data && <>
        <p role="status">{data.total} nghề có nguồn · Trang {data.page}</p>
        {!data.items.length ? <section className={styles.state}>
          <h2>{data.total > 0 ? "Trang này vượt quá kết quả" : q || code ? "Không có nghề phù hợp" : "Danh mục nghề chưa có dữ liệu"}</h2>
          <p>{data.total > 0 ? "Trở về trang đầu để xem kết quả hiện có." : "Thử lại sau hoặc thay đổi từ khóa và nhóm RIASEC."}</p>
          <Button onClick={() => data.total > 0 ? change(1) : setParams({})}>
            {data.total > 0 ? "Về trang đầu" : "Đặt lại bộ lọc"}
          </Button>
        </section> : <div className={styles.grid}>
          {data.items.map((career) => <article className={styles.card} key={career.id} data-ce-enter="">
            <div className={styles.cardTop}>
              <span className={styles.icon} aria-hidden="true">↗</span>
              <span className={styles.id}>{career.id}</span>
            </div>
            <h2><Link to={`/careers/${encodeURIComponent(career.id)}`}>{career.title}</Link></h2>
            <p className={styles.description}>{career.description || "Chưa có mô tả từ nguồn nghề."}</p>
            <div className={styles.cardFooter}>
              <span>{career.sourceVersion}</span>
              <a href={career.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Nguồn O*NET: ${career.title}`}>Nguồn O*NET ↗</a>
            </div>
            <Link className={styles.detail} to={`/careers/${encodeURIComponent(career.id)}`}>Xem chi tiết nghề <span aria-hidden="true">→</span></Link>
          </article>)}
        </div>}
        {data.items.length > 0 && <nav className={styles.pagination} aria-label="Phân trang nghề">
          <Button disabled={page <= 1} onClick={() => change(page - 1)}>Trang trước</Button>
          <span>Trang {data.page}</span>
          <Button disabled={page * data.limit >= data.total || page >= 10000} onClick={() => change(page + 1)}>Trang sau</Button>
        </nav>}
      </>}
      <footer className={styles.source}><SourceNote /></footer>
    </PlatformFrame>
  );
}
