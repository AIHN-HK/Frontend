import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { CareerIllustration } from '@/modules/careers';
import { previewScenarios, previewSorts, readRecommendationView, sortPreviewRecommendations, writeRecommendationView } from '../../model/recommendation.types';
import type { PreviewScenario, PreviewSort } from '../../model/recommendation.types';
import { usePreviewRecommendations } from '../../queries/recommendations.queries';
import { RecommendationsSkeleton } from '../components/RecommendationsSkeleton';
import './recommendations.css';

const states = {
  'no-test': { title: 'Chưa có kết quả Holland · Tình huống mẫu', description: 'Ví dụ người dùng chưa hoàn thành trắc nghiệm. Chưa hiển thị gợi ý nghề.', path: paths.assessment, action: 'Mở trắc nghiệm Holland' },
  'no-profile': { title: 'Thiếu thông tin hồ sơ · Tình huống mẫu', description: 'Ví dụ thông tin hồ sơ chưa sẵn sàng để đối chiếu. Chưa hiển thị gợi ý nghề.', path: paths.careerProfile, action: 'Mở hồ sơ cá nhân' },
  empty: { title: 'Không có gợi ý · Tình huống mẫu', description: 'Bản minh họa cho danh sách kết quả trống. Không có nghề nào được tự thêm vào.', path: paths.previewCareers, action: 'Khám phá nghề mẫu' },
  error: { title: 'Không thể tạo gợi ý · Tình huống mẫu', description: 'Đây là trạng thái lỗi minh họa. Đổi tình huống để xem các trạng thái khác; không gửi lại yêu cầu AI.', path: paths.previewCareers, action: 'Khám phá nghề mẫu' },
};

export function RecommendationsPreviewPage() {
  const [params, setParams] = useSearchParams();
  const view = readRecommendationView(params);
  const result = usePreviewRecommendations(view.scenario);
  const setView = (scenario: PreviewScenario, sort = view.sort) => setParams(writeRecommendationView({ scenario, sort }), { preventScrollReset: true });
  const data = result.data;
  const items = data ? sortPreviewRecommendations(data.items, view.sort) : [];
  const query = writeRecommendationView(view).toString();
  const isolatedState = view.scenario !== 'ready' && view.scenario !== 'stale' && view.scenario !== 'generating' ? states[view.scenario] : null;

  return <div className="recommendations-preview">
    <div className="recommendations-preview-note" role="note"><strong>Dữ liệu mẫu · Preview T14</strong><p>Thứ tự, điểm, lý do và kỹ năng dưới đây là minh họa, không phải gợi ý cho tài khoản của bạn. Không có AI thật đang xếp hạng nghề.</p></div>
    <div className="recommendations-preview-controls"><label>Tình huống preview<select value={view.scenario} onChange={event => setView(event.target.value as PreviewScenario)}>{Object.entries(previewScenarios).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
    <header className="recommendations-header"><div><span className="badge">Gợi ý nghề · Minh họa</span><h1>Những nghề bạn có thể khám phá</h1><p>Bản xem trước cách trình bày danh sách gợi ý. Các thông tin minh họa được giữ riêng với hồ sơ và kết quả Holland thật.</p></div>
      <label>Sắp xếp gợi ý mẫu<select disabled={view.scenario !== 'ready' && view.scenario !== 'stale'} value={view.sort} onChange={event => setView(view.scenario, event.target.value as PreviewSort)}>{Object.entries(previewSorts).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </header>
    {view.scenario === 'generating' ? <RecommendationsSkeleton generating /> : isolatedState ? <section className="recommendations-state"><h2>{isolatedState.title}</h2><p>{isolatedState.description}</p><Link className="btn btn-secondary" to={isolatedState.path}>{isolatedState.action}</Link></section> : result.isPending ? <RecommendationsSkeleton /> : result.isError ? <section className="recommendations-state"><h2>Không thể tải gợi ý mẫu</h2><p>Không đọc được dữ liệu cho bản xem trước.</p><Button disabled={result.isFetching} onClick={() => void result.refetch()}>Thử tải lại dữ liệu mẫu</Button></section> : data && <>
      <section className="recommendations-context" aria-label="Ngữ cảnh mẫu"><p>Holland mẫu: {data.context.hollandCode}</p><p>Lần làm mẫu: {data.context.attemptRef}</p><p>Hồ sơ nguồn: {data.context.profileRevision}</p><p>Hồ sơ hiện tại (mẫu): {view.scenario === 'stale' ? 'preview-profile-v2' : data.context.profileRevision}</p><p>Ngày tạo minh họa: {data.createdAt.split('-').reverse().join('/')}</p></section>
      {view.scenario === 'stale' && <p className="recommendations-stale" role="alert">Hồ sơ mẫu đã thay đổi. Đây là kết quả minh họa từ phiên bản hồ sơ cũ, chỉ để đọc lại; không phải gợi ý hiện hành.</p>}
      <p role="status" className="recommendations-count">{items.length} gợi ý mẫu · {previewSorts[view.sort]}</p>
      {!items.length && <section className="recommendations-state"><h2>Không có gợi ý · Tình huống mẫu</h2><p>Nguồn mẫu hiện không có kết quả.</p></section>}
      <div className="recommendations-list">{items.map(item => <article className="recommendations-card" key={item.recommendationId}>
        <div className="recommendations-card-top"><div className="recommendations-title-row"><div className="recommendations-thumb"><CareerIllustration category={item.career.category} /></div><div><span className="recommendations-source-rank">Thứ tự mẫu: {item.rank}</span><h2>{item.career.name}</h2><p>Nhóm RIASEC mẫu: {item.career.riasec.join(' · ')}</p></div></div><span className="recommendations-match">{item.mockMatchPercent === null ? 'Chưa có điểm minh họa' : `${item.mockMatchPercent}% · Điểm minh họa`}</span></div>
        <p className="recommendations-summary">{item.career.summary}</p><div className="recommendations-reason"><strong>Lý do minh họa: </strong>{item.reason ?? 'Chưa có lý do minh họa cho gợi ý này.'}</div>
        <footer><div className="recommendations-skills"><span>Kỹ năng minh họa:</span>{item.skills.length ? item.skills.map((skill, index) => <span className={`recommendations-skill recommendations-skill-${skill.state}`} key={index}>{skill.label} · {skill.state === 'have' ? 'Có sẵn (mẫu)' : 'Cần phát triển (mẫu)'}</span>) : <span>Chưa có kỹ năng minh họa.</span>}</div>
          <div className="recommendations-links"><Link className="btn btn-secondary" to={paths.previewCareer(item.careerId)}>Xem hồ sơ nghề mẫu</Link><Link className="btn btn-primary" to={paths.previewRecommendation(item.recommendationId) + (query ? `?${query}` : '')}>Xem phân tích mẫu →</Link></div>
        </footer>
      </article>)}</div>
    </>}
    <p className="recommendations-unavailable">Đặt mục tiêu chưa sẵn sàng. Nghề mẫu không được lưu vào hồ sơ.</p>
  </div>;
}
