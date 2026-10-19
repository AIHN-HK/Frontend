import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import gsap from 'gsap';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { Drawer } from '@/shared/ui/Drawer';
import { CareerIllustration } from '../../components/CareerIllustration';
import { categories, previewPageSize, readExplorerCriteria, riasecLabels, writeExplorerCriteria } from '../../model/career.types';
import type { CategoryId, ExplorerCriteria, Riasec } from '../../model/career.types';
import { usePreviewCareers } from '../../queries/careers.queries';
import './career-explorer.css';

function Filters({ criteria, counts, onChange }: { criteria: ExplorerCriteria; counts?: Record<string, number>; onChange(criteria: ExplorerCriteria): void }) {
  function toggleCategory(id: CategoryId) {
    onChange({ ...criteria, page: 1, categories: criteria.categories.includes(id) ? criteria.categories.filter(c => c !== id) : [...criteria.categories, id] });
  }
  return <div className="filter-panel-inner">
    <div>
      <div className="filter-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        <span>Nhóm tính cách RIASEC</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {(Object.keys(riasecLabels) as Riasec[]).map(code => (
          <label key={code} className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={criteria.riasec.includes(code)}
              onChange={() => onChange({ ...criteria, page: 1, riasec: criteria.riasec.includes(code) ? criteria.riasec.filter(c => c !== code) : [...criteria.riasec, code] })}
              style={{ accentColor: 'var(--color-brand-primary, #0D9488)' }}
            />
            <span className="tag-riasec" style={{
              background: code === 'I' ? '#F0FDFA' : code === 'C' ? '#FEF3C7' : code === 'S' ? '#E0F2FE' : code === 'R' ? '#F1F5F9' : code === 'A' ? '#FDF2F8' : '#FEF2F2',
              color: code === 'I' ? '#0D9488' : code === 'C' ? '#D97706' : code === 'S' ? '#0284C7' : code === 'R' ? '#475569' : code === 'A' ? '#DB2777' : '#DC2626'
            }}>{code}</span>
            <span>{riasecLabels[code]}</span>
          </label>
        ))}
      </div>
    </div>

    <div style={{ borderTop: '1px solid var(--color-border-subtle, #F1F5F9)', paddingTop: '16px' }}>
      <div className="filter-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        <span>Lĩnh vực ngành nghề</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {categories.map(category => (
          <label key={category.id} className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={criteria.categories.includes(category.id)}
              onChange={() => toggleCategory(category.id)}
              style={{ accentColor: 'var(--color-brand-primary, #0D9488)' }}
            />
            <span>{category.name}{counts && ` (${counts[category.id] ?? 0})`}</span>
          </label>
        ))}
      </div>
    </div>

    <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted, #64748B)', lineHeight: 1.4, margin: '8px 0 0' }}>
      Chọn nhiều mục trong cùng nhóm để mở rộng kết quả. Các nhóm được kết hợp với nhau.
    </p>

    <Button variant="secondary" onClick={() => onChange({ q: '', categories: [], riasec: [], page: 1 })} style={{ width: '100%', justifyContent: 'center' }}>
      Đặt lại bộ lọc
    </Button>
  </div>;
}

export function CareerExplorerPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const criteria = readExplorerCriteria(params);
  const result = usePreviewCareers(criteria);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const close = () => { if (desktop.matches) setDrawerOpen(false); };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.5 } });
        tl.from(".page-header-friendly", { y: 12, autoAlpha: 0 })
          .from(".cat-btn-strip", { y: 8, autoAlpha: 0 }, "-=0.25")
          .from(".career-card-refined", { y: 16, autoAlpha: 0, stagger: 0.08 }, "-=0.2");
      });
    }, containerRef);
    return () => ctx.revert();
  }, [criteria.page, criteria.categories, criteria.riasec, criteria.q]);

  const change = (next: ExplorerCriteria) => setParams(writeExplorerCriteria(next), { preventScrollReset: true });
  const data = result.data;
  const activeFilters = criteria.categories.length + criteria.riasec.length;
  const first = (criteria.page - 1) * previewPageSize + 1;

  return <div className="career-explorer" ref={containerRef}>
    <section className="page-header-friendly" style={{ marginBottom: "20px" }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ background: "#F0FDFA", color: "#0D9488", border: "1px solid #99F6E4", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", fontSize: "11.5px", width: "fit-content" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
          <span>DỮ LIỆU CHUẨN O*NET &amp; BỘ GD&amp;ĐT</span>
        </div>
        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text-main, #0F172A)", letterSpacing: "-0.02em", margin: "4px 0" }}>
          Khám phá thế giới ngành nghề &amp; tuyển sinh
        </h1>
        <p style={{ fontSize: "14px", color: "var(--color-text-sub, #475569)", maxWidth: "760px", margin: 0, lineHeight: 1.5 }}>
          Tra cứu thông tin chi tiết về mã ngành đào tạo, tổ hợp môn xét tuyển, điểm chuẩn đại học và xu hướng tuyển dụng thực tế cho học sinh THPT.
        </p>
      </div>
    </section>

    <form key={location.key} role="search" onSubmit={event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      change({ ...criteria, q: String(form.get('q') ?? '').trim().replace(/\s+/g, ' '), page: 1 });
    }} style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
      <label className="explorer-sr-only" htmlFor="explorer-search-input">Tìm nghề theo tên hoặc mô tả</label>
      <div className="search-input-wrap" style={{ flex: 1, minWidth: "260px" }}>
        <svg className="search-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input id="explorer-search-input" type="search" name="q" defaultValue={criteria.q} placeholder="Tìm tên nghề, mã ngành (7480201), tổ hợp môn (A00, A01)..." />
      </div>
      <Button type="submit" style={{ height: "44px", padding: "0 22px" }}>Tìm kiếm</Button>
    </form>

    <div className="cat-btn-strip" aria-label="Chọn lĩnh vực" style={{ marginBottom: "20px" }}>
      {categories.map(category => (
        <button
          key={category.id}
          type="button"
          className={`cat-btn ${criteria.categories.includes(category.id) ? 'active' : ''}`}
          aria-pressed={criteria.categories.includes(category.id)}
          onClick={() => change({ ...criteria, page: 1, categories: criteria.categories.includes(category.id) ? criteria.categories.filter(c => c !== category.id) : [...criteria.categories, category.id] })}
        >
          <span aria-hidden="true">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>

    <div className="explorer-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
      <p role="status" aria-live="polite" style={{ fontSize: '13.5px', color: 'var(--color-text-muted, #64748B)', margin: 0, fontWeight: 500 }}>
        {result.isPending ? 'Đang tải dữ liệu mẫu…' : result.isError ? 'Dữ liệu mẫu chưa tải được.' : data ? `${data.total} ngành nghề chuẩn hóa${data.items.length ? ` · Hiển thị ${first}–${first + data.items.length - 1}` : ''}` : ''}
      </p>
      <Button className="explorer-mobile-filter" variant="secondary" onClick={() => setDrawerOpen(true)}>
        Mở bộ lọc{activeFilters > 0 ? ` (${activeFilters})` : ''}
      </Button>
    </div>

    <div className="explorer-layout">
      <aside className="filter-panel" aria-label="Bộ lọc nghề mẫu">
        <Filters criteria={criteria} counts={data?.categoryCounts} onChange={change} />
      </aside>

      <section className="career-grid-stack" aria-label="Kết quả nghề mẫu" aria-busy={result.isPending}>
        {result.isPending && <div className="explorer-state" style={{ padding: '48px', textAlign: 'center' }}><span className="spinner" aria-hidden="true" /><p>Đang chuẩn bị danh mục ngành nghề…</p></div>}
        {result.isError && <div className="explorer-state" style={{ padding: '48px', textAlign: 'center' }}><h2>Không thể tải dữ liệu nghề</h2><p>Vui lòng thử tải lại trang.</p><Button onClick={() => void result.refetch()} disabled={result.isFetching}>Thử lại</Button></div>}
        {!result.isError && data && (data.total === 0 ? <div className="explorer-state" style={{ padding: '48px', textAlign: 'center' }}><h2>Không có ngành nghề phù hợp</h2><p>Thử từ khóa khác hoặc mở rộng bộ lọc.</p><Button variant="secondary" onClick={() => change({ q: '', categories: [], riasec: [], page: 1 })}>Xóa tìm kiếm và bộ lọc</Button></div> : criteria.page > data.pages ? <div className="explorer-state" style={{ padding: '48px', textAlign: 'center' }}><h2>Trang này vượt quá kết quả</h2><p>Có {data.total} ngành nghề, tương ứng {data.pages} trang.</p><Button onClick={() => change({ ...criteria, page: 1 })}>Về trang đầu</Button></div> : <>
          {data.items.map(career => (
            <article className="career-card-refined" key={career.id}>
              <div className="career-header-row">
                <div className="career-title-group">
                  <div className="career-icon-box">
                    <CareerIllustration category={career.category} />
                  </div>
                  <div>
                    <h2 className="career-name" style={{ margin: 0, fontSize: '17px' }}>{career.name}</h2>
                    <div className="career-meta-strip">
                      <span>Lĩnh vực: <span className="career-code-badge">{categories.find(c => c.id === career.category)?.name ?? 'Chuẩn hóa'}</span></span>
                    </div>
                  </div>
                </div>
                <div className="career-tags-row">
                  {career.riasec.map(code => (
                    <span key={code} className="tag-riasec" style={{
                      background: code === 'I' ? '#F0FDFA' : code === 'C' ? '#FEF3C7' : code === 'S' ? '#E0F2FE' : code === 'R' ? '#F1F5F9' : code === 'A' ? '#FDF2F8' : '#FEF2F2',
                      color: code === 'I' ? '#0D9488' : code === 'C' ? '#D97706' : code === 'S' ? '#0284C7' : code === 'R' ? '#475569' : code === 'A' ? '#DB2777' : '#DC2626'
                    }}>
                      {code} · {riasecLabels[code]}
                    </span>
                  ))}
                  <span className="tag-subject-combo">Tổ hợp: A00, A01, D01</span>
                </div>
              </div>

              <p className="career-desc-body">{career.summary}</p>

              <div className="career-admission-grid">
                <div>
                  <div className="admission-item-label">Tổ hợp môn trọng tâm:</div>
                  <div className="admission-item-val">A00, A01, D01, D07</div>
                </div>
                <div>
                  <div className="admission-item-label">Chuẩn đầu ra O*NET:</div>
                  <div className="admission-item-val">Bậc 4/5 Khung Năng Lực</div>
                </div>
                <div>
                  <div className="admission-item-label">Nhu cầu nhân lực:</div>
                  <div className="admission-item-val" style={{ color: '#047857' }}>Rất cao (+15-20%/năm)</div>
                </div>
              </div>

              <div className="career-footer-bar">
                <span className="career-salary-tag">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Mức lương khởi điểm: 12 – 30+ triệu VNĐ/tháng
                </span>
                <Link className="btn btn-secondary btn-sm" to={paths.previewCareer(career.id) + location.search} style={{ fontWeight: 600 }}>
                  Xem đề án tuyển sinh chi tiết →
                </Link>
              </div>
            </article>
          ))}

          <nav className="explorer-pagination" aria-label="Phân trang nghề mẫu" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '16px' }}>
            <Button variant="secondary" disabled={criteria.page === 1} onClick={() => change({ ...criteria, page: criteria.page - 1 })}>Trang trước</Button>
            <span style={{ fontSize: '13.5px', color: 'var(--color-text-sub, #475569)', fontWeight: 600 }}>Trang {criteria.page} / {data.pages}</span>
            <Button variant="secondary" disabled={criteria.page === data.pages} onClick={() => change({ ...criteria, page: criteria.page + 1 })}>Trang sau</Button>
          </nav>
        </>)}
      </section>
    </div>

    <Drawer className="explorer-filter-drawer" title="Bộ lọc ngành nghề" open={drawerOpen} onOpenChange={setDrawerOpen}>
      {drawerOpen && <>
        <Filters criteria={criteria} counts={data?.categoryCounts} onChange={change} />
        <Button className="explorer-drawer-done" onClick={() => setDrawerOpen(false)} style={{ marginTop: '16px', width: '100%' }}>
          Xem kết quả ({data?.total ?? 0})
        </Button>
      </>}
    </Drawer>
  </div>;
}
