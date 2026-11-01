import { Link, useParams, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { Button } from '@/shared/ui/Button';
import { CareerIllustration } from '@/modules/careers';
import {
  isPreviewRecommendationId,
  readRecommendationView,
  writeRecommendationView,
} from '../../model/recommendation.types';
import { usePreviewRecommendation } from '../../queries/recommendations.queries';
import '../../list/pages/recommendations.css';
import './recommendation-detail.css';

export function RecommendationDetailPage() {
  const { recommendationId } = useParams(),
    [params] = useSearchParams();
  const result = usePreviewRecommendation(recommendationId),
    view = readRecommendationView(params);
  const query = writeRecommendationView(view).toString(),
    item = result.data?.item;
  const title = !isPreviewRecommendationId(recommendationId)
    ? 'Mã gợi ý mẫu không hợp lệ'
    : result.isError
      ? 'Không thể tải phân tích mẫu'
      : result.isPending
        ? 'Đang tải phân tích mẫu'
        : !item
          ? 'Không tìm thấy gợi ý mẫu'
          : null;
  return (
    <div className="recommendations-preview recommendation-detail">
      <Link className="btn btn-secondary" to={paths.previewRecommendations + (query ? `?${query}` : '')}>
        Quay lại gợi ý mẫu
      </Link>
      <div className="recommendations-preview-note" role="note">
        <strong>Dữ liệu mẫu · Phân tích gợi ý</strong>
        <p>Đây là lý do minh họa, không phải phân tích cho bạn.</p>
      </div>
      {title ? (
        <section className="recommendations-state">
          <h1>{title}</h1>
          {result.isError && (
            <Button disabled={result.isFetching} onClick={() => void result.refetch()}>
              Thử tải lại phân tích mẫu
            </Button>
          )}
        </section>
      ) : (
        item && (
          <>
            {view.scenario === 'stale' && (
              <p className="recommendations-stale" role="alert">
                Hồ sơ mẫu đã đổi. Kết quả này chỉ để đọc lại.
              </p>
            )}
            <header className="recommendations-header">
              <div className="recommendations-title-row">
                <CareerIllustration category={item.career.category} size={72} />
                <div>
                  <h1>Phân tích mẫu: {item.career.name}</h1>
                  <p>
                    Ngữ cảnh mẫu: {result.data?.context.attemptRef} · {result.data?.context.profileRevision}
                  </p>
                </div>
              </div>
              <span className="recommendations-match">
                {item.mockMatchPercent ?? 'Chưa có điểm'}
                {item.mockMatchPercent !== null && '%'} · Minh họa
              </span>
            </header>
            <div className="recommendation-detail-grid">
              <div className="recommendations-list">
                <section className="recommendations-card">
                  <h2>Vì sao có gợi ý này? · Minh họa</h2>
                  <p className="recommendations-reason">{item.reason ?? 'Chưa có lý do minh họa.'}</p>
                  <div className="recommendation-evidence">
                    <section>
                      <h3>Holland mẫu</h3>
                      <p>{result.data?.context.hollandCode}</p>
                      <p>Không phải điểm đóng góp cho độ phù hợp.</p>
                    </section>
                    <section>
                      <h3>Sở thích cá nhân</h3>
                      <p>Chưa có thông tin sở thích được xác minh.</p>
                    </section>
                    <section>
                      <h3>Kỹ năng</h3>
                      <p>Các nhãn kỹ năng chỉ để minh họa.</p>
                    </section>
                  </div>
                </section>
                <section className="recommendations-card">
                  <h2>Đóng góp của từng nhóm RIASEC</h2>
                  <p>Chưa xác minh được mức đóng góp của từng nhóm RIASEC.</p>
                  <p>Mã Holland và thông tin nghề chung chưa đủ để tính phần trăm đóng góp.</p>
                </section>
                <section className="recommendations-card">
                  <h2>So sánh kỹ năng · Minh họa</h2>
                  <div className="recommendation-evidence">
                    {(['have', 'develop'] as const).map((state) => (
                      <section key={state}>
                        <h3>{state === 'have' ? 'Có sẵn (mẫu)' : 'Cần phát triển (mẫu)'}</h3>
                        <ul>
                          {item.skills
                            .filter((skill) => skill.state === state)
                            .map((skill, i) => (
                              <li key={i}>{skill.label}</li>
                            ))}
                        </ul>
                        {!item.skills.some((skill) => skill.state === state) && (
                          <p>Chưa có kỹ năng minh họa.</p>
                        )}
                      </section>
                    ))}
                  </div>
                </section>
                <section className="recommendations-card">
                  <h2>Thông tin nghề chung</h2>
                  <p>{item.career.summary}</p>
                  <Link className="btn btn-secondary" to={paths.previewCareer(item.careerId)}>
                    Xem hồ sơ nghề mẫu
                  </Link>
                  <h3>Ngành học và tuyển sinh</h3>
                  <p>Chưa có dữ liệu tuyển sinh được xác nhận.</p>
                </section>
                <section className="recommendations-card">
                  <h2>Nguồn tham khảo</h2>
                  <p>
                    Lý do từ dữ liệu mẫu nội bộ, {result.data?.createdAt}. Chưa dùng thông tin cá nhân đã xác minh.
                  </p>
                  <p>Tài liệu về nghề, không xác nhận mức phù hợp của bạn.</p>
                  {item.career.detail?.references?.length ? (
                    item.career.detail.references.map((ref) => (
                      <a
                        className="btn btn-secondary"
                        key={ref.url}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ref.label} ↗
                      </a>
                    ))
                  ) : (
                    <p>Chưa có nguồn tham khảo cho nghề này.</p>
                  )}
                </section>
              </div>
              <aside className="recommendations-card recommendation-detail-sidebar">
                <h2>Bước tiếp theo</h2>
                <p>Chưa thể tạo mục tiêu hay lộ trình từ nghề mẫu. Hồ sơ của bạn không thay đổi.</p>
                <Link className="btn btn-secondary" to={paths.advisor}>
                  Hỏi AIHN
                </Link>
                <p>Thông tin nghề mẫu chưa được gửi cho AIHN.</p>
                <Link className="btn btn-secondary" to={paths.previewRoadmap}>
                  Xem lộ trình mẫu
                </Link>
              </aside>
            </div>
          </>
        )
      )}
    </div>
  );
}
