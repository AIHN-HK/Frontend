import { Link, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { templates, stages, templateId } from '../model/templates';
import './roadmap.css';
export function RoadmapPage() {
  const [params, setParams] = useSearchParams(),
    id = templateId(params.get('target')),
    template = id ? templates[id] : null;
  return (
    <div className="roadmap-preview">
      <header>
        <p className="roadmap-note" role="note">
          Bản mẫu chỉ đọc · Không phải lộ trình hay tiến độ đã lưu của bạn.
        </p>
        <h1>{template ? `Lộ trình mẫu: ${template.name}` : 'Chọn lộ trình mẫu'}</h1>
        <p>Mẫu THPT → Đại học để tham khảo giao diện. Các bước có thể không phù hợp với hoàn cảnh của bạn.</p>
        <label className="roadmap-selector">
          Mục tiêu mẫu
          <select
            value={id ?? ''}
            onChange={(e) => setParams(e.target.value ? { target: e.target.value } : {})}
          >
            <option value="">Chưa chọn</option>
            {Object.entries(templates).map(([key, item]) => (
              <option value={key} key={key}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </header>
      {template ? (
        <>
          <div className="roadmap-timeline">
            {stages.map((stage, i) => (
              <section key={`${id}-${i}`} className="roadmap-stage">
                <span className="roadmap-marker" aria-hidden="true">
                  {i + 1}
                </span>
                <h2>{stage}</h2>
                <p>{template.tasks[i]}</p>
                <small>Gợi ý mẫu · Chưa theo dõi hoàn thành</small>
              </section>
            ))}
          </div>
          <Link className="btn btn-secondary" to={paths.previewCareer(template.careerId)}>
            Xem thông tin nghề mẫu
          </Link>
        </>
      ) : (
        <section className="roadmap-stage">
          <h2>Chưa chọn mục tiêu mẫu</h2>
          <p>Chọn một mẫu bên trên để xem các giai đoạn.</p>
          <Link className="btn btn-secondary" to={paths.previewRecommendations}>
            Khám phá gợi ý mẫu
          </Link>
        </section>
      )}
      <aside className="roadmap-stage">
        <h2>Tiến độ cá nhân chưa sẵn sàng</h2>
        <p>
          Chưa hỗ trợ đặt mục tiêu, đánh dấu hoàn thành hay lưu tiến độ. Đổi mẫu chỉ đổi nội dung hiển thị.
        </p>
        <Link className="btn btn-secondary" to={paths.advisor}>
          Trao đổi chung với Cố vấn AI
        </Link>
      </aside>
    </div>
  );
}
