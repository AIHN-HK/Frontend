import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Button, Input, Select } from "antd";
import { usePlatformQuery } from "../api/platform.api";
import { catalogSchema, codes } from "../model/contracts";
import { PlatformFrame, SourceNote } from "../components/PlatformUI";
import { SpotlightCard } from "@/shared/ui/SpotlightCard";
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
import styles from "./CareerCatalogPage.module.css";

const groups = ["Thực tế", "Nghiên cứu", "Nghệ thuật", "Xã hội", "Quản lý", "Nghiệp vụ"];

function PaginationJump({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (next: number) => void;
}) {
  const [value, setValue] = useState(String(currentPage));

  const commit = () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || value.trim() === "") {
      setValue(String(currentPage));
      return;
    }
    const target = Math.max(1, Math.min(totalPages, Math.trunc(parsed)));
    setValue(String(target));
    if (target !== currentPage) {
      onPageChange(target);
    }
  };

  return (
    <div className={styles.pageJump}>
      <span>Trang</span>
      <input
        type="number"
        min={1}
        max={totalPages}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        onBlur={commit}
        className={styles.pageInput}
        aria-label="Nhập số trang để chuyển"
        title="Nhập số trang và nhấn Enter để chuyển"
      />
      <span>/ {totalPages}</span>
    </div>
  );
}

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
          popupClassName={styles.groupDropdown}
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
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
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
        <p role="status">{data.total.toLocaleString("vi-VN")} nghề có nguồn · Trang {data.page} / {totalPages}</p>
        {!data.items.length ? <section className={styles.state}>
          {data.total === 0 && <LottieIllustration kind="empty" />}
          <h2>{data.total > 0 ? "Trang này vượt quá kết quả" : q || code ? "Không có nghề phù hợp" : "Danh mục nghề chưa có dữ liệu"}</h2>
          <p>{data.total > 0 ? "Trở về trang đầu để xem kết quả hiện có." : "Thử lại sau hoặc thay đổi từ khóa và nhóm RIASEC."}</p>
          <Button onClick={() => data.total > 0 ? change(1) : setParams({})}>
            {data.total > 0 ? "Về trang đầu" : "Đặt lại bộ lọc"}
          </Button>
        </section> : <div className={styles.grid}>
          {data.items.map((career) => <SpotlightCard className={styles.card} key={career.id}>
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
          </SpotlightCard>)}
        </div>}
        {data.items.length > 0 && <nav className={styles.pagination} aria-label="Phân trang nghề">
          <Button disabled={page <= 1} onClick={() => change(page - 1)}>Trang trước</Button>
          <PaginationJump key={data.page} currentPage={data.page} totalPages={totalPages} onPageChange={change} />
          <Button disabled={page >= totalPages || page >= 10000} onClick={() => change(page + 1)}>Trang sau</Button>
        </nav>}
      </>}
      <footer className={styles.source}><SourceNote /></footer>
    </PlatformFrame>
  );
}
