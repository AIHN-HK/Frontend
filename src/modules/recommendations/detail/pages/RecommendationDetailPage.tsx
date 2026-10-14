import { Link, useParams, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { CareerIllustration } from '@/modules/careers';
import { isPreviewRecommendationId, readRecommendationView, writeRecommendationView } from '../../model/recommendation.types';
import { usePreviewRecommendation } from '../../queries/recommendations.queries';
import '../../list/pages/recommendations.css';
import './recommendation-detail.css';

export function RecommendationDetailPage() {
  const { recommendationId } = useParams(), [params] = useSearchParams();
  const result = usePreviewRecommendation(recommendationId), view = readRecommendationView(params);
  const query = writeRecommendationView(view).toString(), item = result.data?.item;
  const title = !isPreviewRecommendationId(recommendationId) ? 'Mã gợi ý mẫu không hợp lệ' : result.isError ? 'Không thể tải phân tích mẫu' : result.isPending ? 'Đang tải phân tích mẫu' : !item ? 'Không tìm thấy gợi ý mẫu' : null;
  return <div className="recommendations-preview recommendation-detail">
    <Link className="btn btn-secondary" to={paths.previewRecommendations + (query ? `?${query}` : '')}>Quay lại gợi ý mẫu</Link>
    <div className="recommendations-preview-note" role="note"><strong>Dữ liệu mẫu · Phân tích gợi ý</strong><p>Đây là giải thích minh họa từ T14, không phải phân tích cho tài khoản của bạn.</p></div>
    {title ? <section className="recommendations-state"><h1>{title}</h1>{result.isError && <Button disabled={result.isFetching} onClick={() => void result.refetch()}>Thử tải lại phân tích mẫu</Button>}</section> : item && <>
      {view.scenario === 'stale' && <p className="recommendations-stale" role="alert">Hồ sơ mẫu đã thay đổi. Kết quả này chỉ để đọc lại.</p>}
      <header className="recommendations-header"><div className="recommendations-title-row"><CareerIllustration category={item.career.category} size={72} /><div><h1>Phân tích mẫu: {item.career.name}</h1><p>Ngữ cảnh mẫu: {result.data?.context.attemptRef} · {result.data?.context.profileRevision}</p></div></div><span className="recommendations-match">{item.mockMatchPercent ?? 'Chưa có điểm'}{item.mockMatchPercent !== null && '%'} · Minh họa</span></header>
      <div className="recommendation-detail-grid"><div className="recommendations-list">
        <section className="recommendations-card"><h2>Vì sao có gợi ý này? · Minh họa</h2><p className="recommendations-reason">{item.reason ?? 'Chưa có lý do minh họa.'}</p><div className="recommendation-evidence"><section><h3>Holland mẫu</h3><p>{result.data?.context.hollandCode}</p><p>Không phải điểm đóng góp cho độ phù hợp.</p></section><section><h3>Sở thích cá nhân</h3><p>Chưa có bằng chứng sở thích được xác nhận.</p></section><section><h3>Kỹ năng</h3><p>Các nhãn bên dưới chỉ là tình huống minh họa.</p></section></div></section>
        <section className="recommendations-card"><h2>Đóng góp của từng nhóm RIASEC</h2><p>Chưa có dữ liệu đóng góp RIASEC được xác nhận.</p><p>Không suy ra phần trăm đóng góp từ mã Holland hay thông tin nghề chung.</p></section>
        <section className="recommendations-card"><h2>Đối sánh kỹ năng · Minh họa</h2><div className="recommendation-evidence">{(['have', 'develop'] as const).map(state => <section key={state}><h3>{state === 'have' ? 'Có sẵn (mẫu)' : 'Cần phát triển (mẫu)'}</h3><ul>{item.skills.filter(skill => skill.state === state).map((skill, i) => <li key={i}>{skill.label}</li>)}</ul>{!item.skills.some(skill => skill.state === state) && <p>Chưa có kỹ năng minh họa.</p>}</section>)}</div></section>
        <section className="recommendations-card"><h2>Thông tin nghề chung</h2><p>{item.career.summary}</p><Link className="btn btn-secondary" to={paths.previewCareer(item.careerId)}>Xem hồ sơ nghề mẫu</Link><h3>Đào tạo &amp; Tuyển sinh THPT</h3><p>Chưa có dữ liệu tuyển sinh được xác nhận.</p></section>
        <section className="recommendations-card"><h2>Nguồn &amp; Bằng chứng</h2><p>Nguồn giải thích: dữ liệu minh họa nội bộ, {result.data?.createdAt}. Chưa có bằng chứng cá nhân được xác nhận.</p><p>Tài liệu nghề chung, không phải bằng chứng độ phù hợp cá nhân.</p>{item.career.detail?.references?.length ? item.career.detail.references.map(ref => <a className="btn btn-secondary" key={ref.url} href={ref.url} target="_blank" rel="noopener noreferrer">{ref.label} ↗</a>) : <p>Chưa có nguồn tham khảo cho nghề này.</p>}</section>
      </div><aside className="recommendations-card recommendation-detail-sidebar"><h2>Bước tiếp theo</h2><p>Đặt mục tiêu và lộ trình cá nhân chưa sẵn sàng. Không lưu nghề mẫu vào hồ sơ.</p><Link className="btn btn-secondary" to={paths.advisor}>Mở cuộc trò chuyện chung với Cố vấn AI</Link><p>Ngữ cảnh nghề mẫu chưa được gửi cho AI.</p></aside></div>
    </>}
  </div>;
}
