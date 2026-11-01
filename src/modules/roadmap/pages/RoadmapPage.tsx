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
          Lộ trình mẫu · Chỉ để xem, không phải tiến độ của bạn.
        </p>
        <h1>{template ? `Lộ trình mẫu: ${template.name}` : 'Chọn lộ trình mẫu'}</h1>
        <p>Ví dụ các bước từ THPT đến đại học. Bạn có thể cần cách đi khác.</p>
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
                <small>Gợi ý mẫu · Chưa lưu tiến độ</small>
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
          <p>Chọn một mẫu để xem từng giai đoạn.</p>
          <Link className="btn btn-secondary" to={paths.previewRecommendations}>
            Xem gợi ý mẫu
          </Link>
        </section>
      )}
      <aside className="roadmap-stage">
        <h2>Tiến độ cá nhân chưa sẵn sàng</h2>
        <p>
          Bản mẫu chưa lưu mục tiêu hay tiến độ. Đổi mẫu để xem ví dụ khác.
        </p>
        <Link className="btn btn-secondary" to={paths.advisor}>
          Hỏi AIHN
        </Link>
      </aside>
    </div>
  );
}
