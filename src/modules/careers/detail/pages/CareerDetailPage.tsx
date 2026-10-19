import { Link, useParams, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { useSession } from '@/shared/session/session';
import { Button } from '@/shared/ui/Button';
import { CareerIllustration } from '../../components/CareerIllustration';
import { categories, isPreviewCareerId, readExplorerCriteria, riasecLabels, writeExplorerCriteria } from '../../model/career.types';
import { usePreviewCareer } from '../../queries/careers.queries';
import './career-detail.css';

function DetailList({ items, absent, skills = false }: { items?: string[]; absent: string; skills?: boolean }) {
  return items?.length ? <ul className={skills ? 'career-detail-skill-tags' : undefined}>{items.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="career-detail-absent">{absent}</p>;
}

export function CareerDetailPage() {
  const { careerId } = useParams();
  const [params] = useSearchParams();
  const current = useSession();
  const result = usePreviewCareer(careerId);
  const filters = writeExplorerCriteria(readExplorerCriteria(params)).toString();
  const backTo = paths.previewCareers + (filters ? `?${filters}` : '');
  const career = result.data;
  const detail = career?.detail;
  const stateTitle = !isPreviewCareerId(careerId) ? 'Mã nghề mẫu không hợp lệ' : result.isError ? 'Không thể tải hồ sơ nghề mẫu' : result.isPending ? 'Đang tải hồ sơ nghề mẫu' : !career ? 'Không tìm thấy nghề mẫu' : null;

  return <div className="career-detail">
    <Link className="btn btn-secondary career-detail-back" to={backTo}>← Quay lại khám phá nghề</Link>
    <div role="note" className="career-detail-preview-note"><strong>Dữ liệu mẫu · Preview T13</strong><p>Tên nghề, nhiệm vụ, kỹ năng và RIASEC chỉ để minh họa giao diện; chưa phải hồ sơ nghề được xác minh.</p></div>
    {stateTitle ? <section className="career-detail-state" aria-busy={isPreviewCareerId(careerId) && result.isPending}>
      <h1>{stateTitle}</h1>
      {isPreviewCareerId(careerId) && result.isPending && !result.isError ? <p role="status"><span className="spinner" aria-hidden="true" />Đang tải hồ sơ nghề mẫu…</p> : <p>{result.isError ? 'Vui lòng thử tải lại bản xem trước.' : 'Kiểm tra đường dẫn hoặc quay lại danh sách nghề mẫu.'}</p>}
      {result.isError && <Button onClick={() => void result.refetch()} disabled={result.isFetching}>Thử lại</Button>}
    </section> : career && <>
      <header className="career-detail-hero">
        <div className="career-detail-hero-row"><div className="career-detail-title-row"><div className="career-detail-image"><CareerIllustration category={career.category} size={72} /></div><div className="career-detail-title">
          <p className="career-detail-category">{categories.find(category => category.id === career.category)?.name} · Thông tin minh họa</p><h1>{career.name}</h1>
          <div className="career-detail-tags">{career.riasec.map(code => <span className={`career-detail-tag career-detail-tag-${code.toLowerCase()}`} key={code}>{code} · {riasecLabels[code]}</span>)}</div>
        </div></div><section className="career-detail-salary" aria-label="Mức lương"><h2>Mức lương tham khảo</h2><strong>Chưa có dữ liệu</strong><p>Chưa có nguồn lương được xác nhận.</p></section></div>
        <p className="career-detail-summary">{career.summary}</p>
      </header>
      <section className="career-detail-match" aria-label="Độ phù hợp cá nhân"><h2>Độ phù hợp cá nhân</h2><p>Phân tích độ phù hợp cho nghề này chưa có dữ liệu.</p><p>{current.status === 'loading' ? 'Đang kiểm tra phiên đăng nhập…' : current.status === 'authenticated' ? 'Bạn đã đăng nhập. Bạn có thể sử dụng trắc nghiệm Holland và Cố vấn AI.' : 'Bạn có thể đăng nhập khi mở trắc nghiệm Holland hoặc Cố vấn AI.'}</p></section>
      <div className="career-detail-grid"><div className="career-detail-main">
        <section className="career-detail-card"><h2>Nhiệm vụ &amp; Trách nhiệm điển hình</h2><DetailList items={detail?.tasks} absent="Chưa có nhiệm vụ minh họa cho nghề mẫu này." /></section>
        <section className="career-detail-card"><h2>Yêu cầu trình độ &amp; Kỹ năng cốt lõi</h2><div className="career-detail-skills"><section><h3>Kỹ năng chuyên môn</h3><DetailList skills items={detail?.hardSkills} absent="Chưa có kỹ năng chuyên môn minh họa." /></section><section><h3>Kỹ năng mềm</h3><DetailList skills items={detail?.softSkills} absent="Chưa có kỹ năng mềm minh họa." /></section></div><p className="career-detail-absent">Yêu cầu bằng cấp và chứng chỉ chưa có nguồn được xác nhận.</p></section>
        <section className="career-detail-card career-detail-admissions"><h2>Dành cho học sinh THPT: Đào tạo &amp; Tuyển sinh</h2><p>Chưa có dữ liệu tuyển sinh được xác nhận.</p><div className="career-detail-admissions-grid"><section><h3>Ngành đào tạo</h3><p>Chưa có ngành học và mã ngành được đối chiếu.</p></section><section><h3>Tổ hợp xét tuyển</h3><p>Chưa có tổ hợp, phương thức và năm tuyển sinh.</p></section><section><h3>Trường &amp; Điểm chuẩn</h3><p>Chưa có thông tin trường và điểm chuẩn có nguồn.</p></section></div></section>
        <section className="career-detail-card"><h2>Nguồn nội dung &amp; Tài liệu tham khảo</h2><p>Nguồn nội dung: bản minh họa nội bộ, chưa phải catalog nghề được xác minh.</p>{detail?.updatedAt ? <p>Ngày cập nhật nội dung mẫu: <time dateTime={detail.updatedAt}>{detail.updatedAt.split('-').reverse().join('/')}</time>.</p> : <p>Chưa có ngày cập nhật chi tiết cho nghề mẫu này.</p>}
          {detail?.references?.length ? <><h3>Tài liệu học tập tham khảo</h3><p>Không dùng các tài liệu này để xác nhận mức lương hoặc tuyển sinh.</p><ul className="career-detail-references">{detail.references.map(reference => <li key={reference.url}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.label}<span className="career-detail-external-hint">Mở tab mới ↗</span></a><span>Kiểm tra liên kết: <time dateTime={reference.checkedAt}>{reference.checkedAt.split('-').reverse().join('/')}</time></span></li>)}</ul></> : <p className="career-detail-absent">Chưa có tài liệu tham khảo cho nghề mẫu này.</p>}
        </section>
      </div><aside className="career-detail-sidebar" aria-label="Bước tiếp theo">
        <section className="career-detail-card"><h2>Bạn quan tâm đến nghề này?</h2><p>Bạn có thể tìm hiểu sở thích của mình bằng trắc nghiệm Holland hoặc mở cuộc trò chuyện chung với Cố vấn AI.</p><Link className="btn btn-primary" to={paths.assessment}>Làm trắc nghiệm Holland</Link><Link className="btn btn-secondary" to={paths.advisor}>Trao đổi với Cố vấn AI</Link><p className="career-detail-absent">Nghề mẫu chưa được gửi cho AI. Tạo mục tiêu nghề và lộ trình cho nghề này chưa sẵn sàng.</p></section>
      </aside></div>
    </>}
  </div>;
}
