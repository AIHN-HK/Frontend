import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
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
  return <div className="explorer-filters">
    <fieldset><legend>Nhóm tính cách RIASEC</legend>
      {(Object.keys(riasecLabels) as Riasec[]).map(code => <label key={code}>
        <input type="checkbox" checked={criteria.riasec.includes(code)} onChange={() => onChange({ ...criteria, page: 1, riasec: criteria.riasec.includes(code) ? criteria.riasec.filter(c => c !== code) : [...criteria.riasec, code] })} />
        <span aria-hidden="true" className={`explorer-tag explorer-tag-${code.toLowerCase()}`}>{code}</span><span><span className="explorer-sr-only">{code} · </span>{riasecLabels[code]}</span>
      </label>)}
    </fieldset>
    <fieldset><legend>Lĩnh vực ngành nghề</legend>
      {categories.map(category => <label key={category.id}>
        <input type="checkbox" checked={criteria.categories.includes(category.id)} onChange={() => toggleCategory(category.id)} />
        <span>{category.name}{counts && ` (${counts[category.id] ?? 0})`}</span>
      </label>)}
    </fieldset>
    <p className="explorer-hint">Chọn nhiều mục trong cùng nhóm để mở rộng kết quả. Các nhóm được kết hợp với nhau.</p>
    <Button variant="secondary" onClick={() => onChange({ q: '', categories: [], riasec: [], page: 1 })}>Đặt lại bộ lọc</Button>
  </div>;
}

export function CareerExplorerPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const criteria = readExplorerCriteria(params);
  const result = usePreviewCareers(criteria);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const close = () => { if (desktop.matches) setDrawerOpen(false); };
    desktop.addEventListener('change', close);
    return () => desktop.removeEventListener('change', close);
  }, []);
  const change = (next: ExplorerCriteria) => setParams(writeExplorerCriteria(next), { preventScrollReset: true });
  const data = result.data;
  const activeFilters = criteria.categories.length + criteria.riasec.length;
  const first = (criteria.page - 1) * previewPageSize + 1;

  return <div className="career-explorer">
    <div role="note" className="explorer-preview-note"><strong>Dữ liệu mẫu · Preview T12</strong><p>Tên nghề, mô tả và RIASEC chỉ dùng kiểm tra giao diện; chưa phải danh mục nghề đã xác minh.</p></div>
    <header className="explorer-heading"><span className="badge">🧭 Khám phá mở rộng</span><h1>Khám phá thế giới nghề nghiệp</h1><p>Tìm kiếm và khám phá các nhóm nghề trong bản xem trước. Bạn có thể kết hợp lĩnh vực với nhóm RIASEC.</p></header>
    <form key={location.key} role="search" className="explorer-search" onSubmit={event => {
      event.preventDefault(); const form = new FormData(event.currentTarget);
      change({ ...criteria, q: String(form.get('q') ?? '').trim().replace(/\s+/g, ' '), page: 1 });
    }}>
      <label className="explorer-sr-only" htmlFor="explorer-search-input">Tìm nghề theo tên hoặc mô tả</label>
      <div className="explorer-search-input"><span aria-hidden="true">⌕</span><input id="explorer-search-input" type="search" name="q" defaultValue={criteria.q} placeholder="Tìm tên nghề hoặc mô tả…" /></div>
      <Button type="submit">Tìm kiếm</Button>
    </form>
    <div className="explorer-categories" aria-label="Chọn lĩnh vực">
      {categories.map(category => <Button key={category.id} variant="secondary" aria-pressed={criteria.categories.includes(category.id)} onClick={() => change({ ...criteria, page: 1, categories: criteria.categories.includes(category.id) ? criteria.categories.filter(c => c !== category.id) : [...criteria.categories, category.id] })}>
        <span aria-hidden="true">{category.icon}</span>{category.name}
      </Button>)}
    </div>
    <div className="explorer-toolbar"><p role="status" aria-live="polite">{result.isPending ? 'Đang tải dữ liệu mẫu…' : result.isError ? 'Dữ liệu mẫu chưa tải được.' : data ? `${data.total} nghề mẫu${data.items.length ? ` · ${first}–${first + data.items.length - 1}` : ''}` : ''}</p><Button className="explorer-mobile-filter" variant="secondary" onClick={() => setDrawerOpen(true)}>Mở bộ lọc{activeFilters > 0 ? ` (${activeFilters})` : ''}</Button></div>
    <div className="explorer-layout">
      <aside className="explorer-filter-panel" aria-label="Bộ lọc nghề mẫu"><Filters criteria={criteria} counts={data?.categoryCounts} onChange={change} /></aside>
      <section className="explorer-results" aria-label="Kết quả nghề mẫu" aria-busy={result.isPending}>
        {result.isPending && <div className="explorer-state"><span className="spinner" aria-hidden="true" /><p>Đang chuẩn bị các nghề mẫu…</p></div>}
        {result.isError && <div className="explorer-state"><h2>Không thể tải dữ liệu mẫu</h2><p>Vui lòng thử tải lại bản xem trước.</p><Button onClick={() => void result.refetch()} disabled={result.isFetching}>Thử lại</Button></div>}
        {!result.isError && data && (data.total === 0 ? <div className="explorer-state"><h2>Không có nghề mẫu phù hợp</h2><p>Thử từ khóa khác hoặc mở rộng bộ lọc.</p><Button variant="secondary" onClick={() => change({ q: '', categories: [], riasec: [], page: 1 })}>Xóa tìm kiếm và bộ lọc</Button></div> : criteria.page > data.pages ? <div className="explorer-state"><h2>Trang này vượt quá kết quả</h2><p>Có {data.total} nghề mẫu, tương ứng {data.pages} trang.</p><Button onClick={() => change({ ...criteria, page: 1 })}>Về trang đầu</Button></div> : <>
          {data.items.map(career => <article className="explorer-career-card" key={career.id}>
            <div className="explorer-card-top"><div className="explorer-card-title"><span className="explorer-career-icon"><CareerIllustration category={career.category} /></span><div><h2>{career.name}</h2><p>{categories.find(c => c.id === career.category)?.name}</p></div></div>
              <div className="explorer-tags">{career.riasec.map(code => <span className={`explorer-tag explorer-tag-${code.toLowerCase()}`} key={code}>{code} · {riasecLabels[code]}</span>)}</div>
            </div><p className="explorer-summary">{career.summary}</p>
            <footer><span>Thông tin minh họa</span><Link className="btn btn-secondary" to={paths.previewCareer(career.id) + location.search}>Xem hồ sơ nghề →</Link></footer>
          </article>)}
          <nav className="explorer-pagination" aria-label="Phân trang nghề mẫu"><Button variant="secondary" disabled={criteria.page === 1} onClick={() => change({ ...criteria, page: criteria.page - 1 })}>Trang trước</Button><span>Trang {criteria.page} / {data.pages}</span><Button variant="secondary" disabled={criteria.page === data.pages} onClick={() => change({ ...criteria, page: criteria.page + 1 })}>Trang sau</Button></nav>
          <p className="explorer-hint">Hồ sơ nghề trong preview dùng dữ liệu mẫu; thông tin chưa có nguồn xác nhận được ghi rõ trong từng mục.</p>
        </>)}
      </section>
    </div>
    <Drawer className="explorer-filter-drawer" title="Bộ lọc nghề mẫu" open={drawerOpen} onOpenChange={setDrawerOpen}>
      {drawerOpen && <><Filters criteria={criteria} counts={data?.categoryCounts} onChange={change} /><Button className="explorer-drawer-done" onClick={() => setDrawerOpen(false)}>Xem kết quả</Button></>}
    </Drawer>
  </div>;
}
