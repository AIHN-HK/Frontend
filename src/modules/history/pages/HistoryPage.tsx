import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { Button, Tabs } from 'antd';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { Icon } from '@/shared/ui/Icon';
import { analysisLabels, formatChatTime, uniqueTestHistory } from '../model/history.model';
import { useHistoryQueries } from '../queries/history.queries';
import './history.css';
import styles from './HistoryPage.module.css';

export function HistoryPage() {
  const [params, setParams] = useSearchParams(), kind = params.get('kind') === 'chats' ? 'chats' : 'tests';
  const analysisValue = params.get('analysis') ?? '', analysis = Object.hasOwn(analysisLabels, analysisValue) ? analysisValue : '';
  const statusValue = params.get('status'), status = statusValue === 'ACTIVE' || statusValue === 'CLOSED' ? statusValue : '';
  const { tests, chats } = useHistoryQueries(kind), nextPending = useRef(false);
  const root = usePageEntrance(`${kind}:${tests.dataUpdatedAt}:${chats.dataUpdatedAt}`);
  function filter(name: string, value: string) {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(name, value); else next.delete(name); return next; });
  }
  const items = uniqueTestHistory(tests.data?.pages ?? []), filteredTests = items.filter(item => !analysis || item.analyzeType === analysis);
  const chatItems = chats.data ?? [], filteredChats = chatItems.filter(item => !status || item.status === status);
  async function loadMore() {
    if (nextPending.current || tests.isFetching || !tests.hasNextPage) return;
    nextPending.current = true;
    try { await tests.fetchNextPage({ cancelRefetch: false }); } finally { nextPending.current = false; }
  }
  const panel = <>
    <div className="history-filters">
      {kind === 'tests' ? <label>Loại phân tích<select value={analysis} onChange={event => filter('analysis', event.target.value)}><option value="">Tất cả phân tích</option>{Object.entries(analysisLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : <label>Trạng thái phiên<select value={status} onChange={event => filter('status', event.target.value)}><option value="">Tất cả trạng thái</option><option value="ACTIVE">Đang mở</option><option value="CLOSED">Đã đóng</option></select></label>}
    </div>
    <p className="history-note">{kind === 'tests' ? 'Các lần làm theo thứ tự đã lưu. Bộ lọc chỉ áp dụng cho mục đã tải.' : 'Hội thoại mới nhất ở trước. Thời gian theo giờ Việt Nam (UTC+7).'}</p>
    <section className="history-list" aria-label={kind === 'tests' ? 'Lịch sử trắc nghiệm' : 'Danh sách phiên tư vấn'}>
      {kind === 'tests' ? <>
        {!tests.data ? tests.isError ? <div className="history-state" role="alert"><p>Không tải được lịch sử trắc nghiệm.</p><Button disabled={tests.isFetching} onClick={() => { void tests.refetch(); }}>Tải lại lịch sử</Button></div> : <p className="history-state" role="status">Đang tải lịch sử trắc nghiệm…</p> : <>
          <p className="history-count" role="status">Đã tải {items.length} lần làm · Hiển thị {filteredTests.length} mục</p>
          {!items.length ? <div className="history-state"><p>Làm một bài trắc nghiệm để bắt đầu.</p><Link className="btn btn-secondary" to={paths.assessment}>Làm trắc nghiệm</Link></div> : !filteredTests.length ? <p className="history-state">Chưa có lần làm khớp bộ lọc trong các mục đã tải.</p> : filteredTests.map(item => <article data-ce-enter="" className="history-card" key={item.attemptId} aria-label={`Lần làm #${item.attemptId}`}>
            <div className="history-card-main"><span className="history-icon test"><Icon name="history" /></span><div><h2>Hoàn thành Trắc nghiệm Holland · Lần làm #{item.attemptId}</h2><p>{item.primaryAnalyze?.title || 'Chưa có phần diễn giải kết quả.'}</p>{item.primaryAnalyze?.code && <p className="history-meta">Mã phân tích: {item.primaryAnalyze.code}</p>}<p className="history-meta">{analysisLabels[item.analyzeType]}</p></div></div>
            <div className="history-card-side"><p className="history-meta">Hoàn thành: {item.finishAt}</p><Link className="history-result" to={paths.assessmentResult(item.attemptId)}>Xem kết quả<span aria-hidden="true">→</span></Link></div>
          </article>)}
          {tests.isError && <div className="history-state" role="alert"><p>{tests.isFetchNextPageError ? 'Chưa tải được trang tiếp. Các lần làm đã tải vẫn còn.' : 'Chưa cập nhật được lịch sử. Các lần làm đã tải vẫn còn.'}</p><Button disabled={tests.isFetching} onClick={() => { if (tests.isFetchNextPageError) void loadMore(); else void tests.refetch(); }}>{tests.isFetchNextPageError ? 'Tải lại trang tiếp' : 'Tải lại lịch sử'}</Button></div>}
          {tests.hasNextPage && !tests.isFetchNextPageError && <Button className="history-more" disabled={tests.isFetching} onClick={() => { void loadMore(); }}>{tests.isFetchingNextPage ? 'Đang tải thêm…' : 'Xem thêm'}</Button>}
          {tests.isFetching && !tests.isFetchingNextPage && <p role="status">Đang cập nhật lịch sử…</p>}
        </>}
      </> : <>
        {!chats.data ? chats.isError ? <div className="history-state" role="alert"><p>Không tải được danh sách phiên tư vấn.</p><Button disabled={chats.isFetching} onClick={() => { void chats.refetch(); }}>Tải lại hội thoại</Button></div> : <p className="history-state" role="status">Đang tải phiên tư vấn…</p> : <>
          <p className="history-count" role="status">Đã tải {chatItems.length} phiên · Hiển thị {filteredChats.length} mục</p>
          {!chatItems.length ? <p className="history-state">Chưa có hội thoại nào được lưu.</p> : !filteredChats.length ? <p className="history-state">Thử đổi bộ lọc để xem hội thoại khác.</p> : filteredChats.map(item => <article data-ce-enter="" className="history-card" key={item.id} aria-label={`Phiên tư vấn #${item.id}`}>
            <div className="history-card-main"><span className="history-icon chat"><Icon name="chat" /></span><div><h2>{item.title?.trim() || `Phiên tư vấn #${item.id}`}</h2><p className="history-meta">Phiên #{item.id} · {item.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}</p></div></div>
            <div className="history-card-side"><p className="history-meta">Tạo lúc: <time dateTime={item.createdAt}>{formatChatTime(item.createdAt)}</time></p><Link className="history-result" to={paths.advisorSession(item.id)}>Đọc lại hội thoại<span aria-hidden="true">→</span></Link></div>
          </article>)}
          {chats.isError && <div className="history-state" role="alert"><p>Chưa cập nhật được hội thoại. Các phiên đã tải vẫn còn.</p><Button disabled={chats.isFetching} onClick={() => { void chats.refetch(); }}>Tải lại hội thoại</Button></div>}
          {chats.isFetching && <p role="status">Đang cập nhật phiên tư vấn…</p>}
        </>}
        <p className="history-note">Chọn một hội thoại để đọc lại trong Hỏi AIHN.</p>
      </>}
    </section>
  </>;
  return <div ref={root} className={`${styles.page} history-page`}>
    <section className="history-header" data-ce-enter="">
      <div><span className="history-tag">Nhìn lại</span><h1>Lịch sử của bạn</h1><p>Đọc lại kết quả trắc nghiệm và các hội thoại đã lưu.</p></div>
    </section>
    <Tabs activeKey={kind} onChange={value => filter('kind', value)} items={[
      {key:'tests',label:'Trắc nghiệm Holland',children:kind === 'tests' ? panel : null},
      {key:'chats',label:'Phiên tư vấn',children:kind === 'chats' ? panel : null},
    ]} />
    <p className="history-note">Chưa xem được lịch sử đổi hồ sơ, lộ trình và gợi ý nghề ở đây.</p>
  </div>;
}
