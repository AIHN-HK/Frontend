import { Button } from "antd";
import { Link, useParams } from "react-router";
import { paths } from "@/routes/paths";
import { ApiError } from "@/shared/api/api-error";
import { RiasecBar } from "@/shared/ui/ce/RiasecBar";
import student from "@/assets/aihn/student-male-laptop.jpg";
import { usePlatformQuery } from "../api/platform.api";
import { careerSchema, codes } from "../model/contracts";
import { PlatformFrame, SourceNote } from "../components/PlatformUI";
import styles from "./CareerRuntimeDetailPage.module.css";

const groupLabels = ["Thực tế", "Nghiên cứu", "Nghệ thuật", "Xã hội", "Quản lý", "Nghiệp vụ"];
const unavailable = ["Thu nhập tại Việt Nam", "Đào tạo và bằng cấp", "Nhu cầu thị trường", "Môi trường làm việc"];

export function CareerRuntimeDetailPage() {
  const { careerId = "" } = useParams();
  const valid = /^\d{2}-\d{4}\.\d{2}$/.test(careerId);
  const result = usePlatformQuery(
    "career", `/api/v1/careers/${encodeURIComponent(careerId)}`, careerSchema, false, valid,
  );
  const career = !result.isError && result.data?.id === careerId ? result.data : undefined;
  const mismatched = result.isSuccess && !career;
  const status = result.error instanceof ApiError ? result.error.status : undefined;
  return (
    <PlatformFrame title={career?.title ?? "Tìm hiểu nghề"} className={styles.page}
      showTitle={!career} animationKey={career ? careerId : "pending"}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <Link to={paths.careers}>Về danh mục nghề</Link>
        <span aria-hidden="true">›</span><span>{career?.title ?? careerId}</span>
      </nav>
      {!valid ? <p role="alert">Đường dẫn nghề chưa đúng.</p> : <>
        {result.isPending && <p role="status">Đang tải thông tin nghề…</p>}
        {result.isError && <div className={styles.state} role="alert">
          <p>{status === 404 ? "Chưa tìm thấy nghề này trong danh mục." : status === 403 ? "Tài khoản này chưa có quyền xem nghề." : "Chưa tải được thông tin nghề. Kiểm tra mạng rồi thử lại."}</p>
          <Button onClick={() => void result.refetch()}>Tải lại</Button>
        </div>}
        {mismatched && <p role="alert">Thông tin tải về không khớp nghề bạn chọn.</p>}
      </>}
      {career && <>
        <section className={styles.hero} data-ce-enter="">
          <div className={styles.heroContent}>
            <p className={styles.tag}>Tìm hiểu nghề · {career.sourceVersion}</p>
            <h1>{career.title}</h1>
            <p className={styles.subtitle}>Mã nghề O*NET {career.id}</p>
            <div className={styles.sourceBadge}>Thông tin tham khảo nghề tại Mỹ</div>
            <div className={styles.actions}>
              <Link className={styles.primaryLink} to={`${paths.careerProfile}?target=${encodeURIComponent(career.id)}`}>Chọn làm mục tiêu</Link>
              <a href={career.sourceUrl} target="_blank" rel="noreferrer">Xem nguồn gốc</a>
            </div>
          </div>
          <div className={styles.photo} data-ce-photo-frame="">
            <img src={student} alt="Sinh viên học tập với laptop · ảnh minh họa" />
            <span className={styles.photoBadge} data-ce-photo-badge="">Ảnh minh họa</span>
          </div>
        </section>
        <dl className={styles.infoGrid} data-ce-enter="">
          {unavailable.map(label => <div key={label}><dt>{label}</dt><dd>Chưa có thông tin được xác minh.</dd></div>)}
        </dl>
        <div className={styles.bodyGrid}>
          <div className={styles.sections}>
            <section className={styles.section} data-ce-enter="">
              <h2>Mô tả công việc</h2>
              <p>{career.description || "Nguồn tham khảo chưa có mô tả."}</p>
            </section>
            <section className={styles.section} data-ce-enter="">
              <h2>Kỹ năng tham khảo</h2>
              {!career.skills.length ? <p>Chưa có thông tin kỹ năng.</p> : <div className={styles.tableWrap}>
                <table>
                  <caption>Kỹ năng nghề từ {career.sourceVersion}</caption>
                  <thead><tr><th scope="col">Kỹ năng</th><th scope="col">Tầm quan trọng /5</th><th scope="col">Mức yêu cầu /5</th></tr></thead>
                  <tbody>{career.skills.map(skill => <tr key={skill.skillId}>
                    <td>{skill.skill.name}</td><td>{skill.importance.toFixed(2)}</td><td>{skill.level.toFixed(2)}</td>
                  </tr>)}</tbody>
                </table>
              </div>}
              <p>Mức yêu cầu được quy đổi từ O*NET. So sánh với tự đánh giá chỉ để tham khảo.</p>
            </section>
            <section className={styles.section} data-ce-enter="">
              <h2>Bạn có thể bắt đầu từ đây</h2>
              <p>Chọn nghề làm mục tiêu, cập nhật kỹ năng rồi xem điều cần rèn thêm.</p>
              <Link to={`${paths.recommendations}?career=${encodeURIComponent(career.id)}`}>Xem nghề phù hợp</Link>
            </section>
          </div>
          <aside className={styles.sidebar} aria-label="Thông tin tham khảo nghề">
            <section className={styles.panel} data-ce-enter="">
              <h2>Hồ sơ sở thích nghề (1–7)</h2>
              <p>Đặc điểm nghề theo O*NET, không phải điểm phù hợp của bạn.</p>
              {codes.map((code, index) => <RiasecBar key={code} code={code} label={groupLabels[index]!}
                percentage={career.riasec[code] / 7 * 100} valueLabel={`${code}: ${career.riasec[code]} / 7`} />)}
            </section>
            <section className={styles.panel} data-ce-enter="">
              <h2>Nguồn tham khảo</h2>
              <p>{career.id} · {career.sourceVersion} · Phiên bản dữ liệu {career.revision}</p>
              <p>Chưa có thông tin được xác minh về nghề liên quan.</p>
            </section>
          </aside>
        </div>
        <footer className={styles.source}><SourceNote /></footer>
      </>}
    </PlatformFrame>
  );
}
