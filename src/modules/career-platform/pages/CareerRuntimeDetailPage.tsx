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
    <PlatformFrame title={career?.title ?? "Chi tiết nghề nghiệp"} className={styles.page}
      showTitle={!career} animationKey={career ? careerId : "pending"}>
      <nav className={styles.breadcrumb} aria-label="Đường dẫn">
        <Link to={paths.careers}>Về danh mục nghề</Link>
        <span aria-hidden="true">›</span><span>{career?.title ?? careerId}</span>
      </nav>
      {!valid ? <p role="alert">Mã nghề không hợp lệ.</p> : <>
        {result.isPending && <p role="status">Đang tải dữ liệu nghề…</p>}
        {result.isError && <div className={styles.state} role="alert">
          <p>{status === 404 ? "Không tìm thấy nghề trong danh mục hiện có." : status === 403 ? "Không có quyền xem dữ liệu nghề này." : "Không tải được dữ liệu nghề. Hãy kiểm tra kết nối và thử lại."}</p>
          <Button onClick={() => void result.refetch()}>Thử tải lại dữ liệu nghề</Button>
        </div>}
        {mismatched && <p role="alert">Dữ liệu trả về không khớp mã nghề được yêu cầu.</p>}
      </>}
      {career && <>
        <section className={styles.hero} data-ce-enter="">
          <div className={styles.heroContent}>
            <p className={styles.tag}>Khám phá nghề · {career.sourceVersion}</p>
            <h1>{career.title}</h1>
            <p className={styles.subtitle}>Mã nghề O*NET {career.id}</p>
            <div className={styles.sourceBadge}>Thông tin tham khảo nghề tại Mỹ</div>
            <div className={styles.actions}>
              <Link className={styles.primaryLink} to={`${paths.careerProfile}?target=${encodeURIComponent(career.id)}`}>Chọn làm mục tiêu trong hồ sơ</Link>
              <a href={career.sourceUrl} target="_blank" rel="noreferrer">Đọc nguồn nghề gốc</a>
            </div>
          </div>
          <div className={styles.photo} data-ce-photo-frame="">
            <img src={student} alt="Sinh viên học tập với laptop · ảnh minh họa" />
            <span className={styles.photoBadge} data-ce-photo-badge="">Khám phá tương lai · Ảnh minh họa</span>
          </div>
        </section>
        <dl className={styles.infoGrid} data-ce-enter="">
          {unavailable.map(label => <div key={label}><dt>{label}</dt><dd>Chưa có dữ liệu có nguồn.</dd></div>)}
        </dl>
        <div className={styles.bodyGrid}>
          <div className={styles.sections}>
            <section className={styles.section} data-ce-enter="">
              <h2>Mô tả công việc</h2>
              <p>{career.description || "Chưa có mô tả từ nguồn nghề."}</p>
            </section>
            <section className={styles.section} data-ce-enter="">
              <h2>Kỹ năng tham khảo</h2>
              {!career.skills.length ? <p>Chưa có dữ liệu kỹ năng.</p> : <div className={styles.tableWrap}>
                <table>
                  <caption>Kỹ năng nghề từ {career.sourceVersion}</caption>
                  <thead><tr><th scope="col">Kỹ năng</th><th scope="col">Tầm quan trọng /5</th><th scope="col">Mức yêu cầu /5</th></tr></thead>
                  <tbody>{career.skills.map(skill => <tr key={skill.skillId}>
                    <td>{skill.skill.name}</td><td>{skill.importance.toFixed(2)}</td><td>{skill.level.toFixed(2)}</td>
                  </tr>)}</tbody>
                </table>
              </div>}
              <p>Mức yêu cầu được quy đổi từ thang O*NET; tự đánh giá cùng thang chỉ mang tính tham khảo.</p>
            </section>
            <section className={styles.section} data-ce-enter="">
              <h2>Bước tiếp theo của bạn</h2>
              <p>Chọn nghề làm mục tiêu trong hồ sơ, bổ sung tự đánh giá kỹ năng rồi xem gợi ý và khoảng cách kỹ năng.</p>
              <Link to={`${paths.recommendations}?career=${encodeURIComponent(career.id)}`}>Xem gợi ý cá nhân và khoảng cách kỹ năng</Link>
            </section>
          </div>
          <aside className={styles.sidebar} aria-label="Thông tin tham khảo nghề">
            <section className={styles.panel} data-ce-enter="">
              <h2>Hồ sơ sở thích nghề (1–7)</h2>
              <p>Đặc điểm của nghề theo O*NET, không phải điểm phù hợp cá nhân.</p>
              {codes.map((code, index) => <RiasecBar key={code} code={code} label={groupLabels[index]!}
                percentage={career.riasec[code] / 7 * 100} valueLabel={`${code}: ${career.riasec[code]} / 7`} />)}
            </section>
            <section className={styles.panel} data-ce-enter="">
              <h2>Nguồn tham khảo</h2>
              <p>{career.id} · {career.sourceVersion} · Phiên bản dữ liệu {career.revision}</p>
              <p>Chưa có dữ liệu nghề liên quan có nguồn trong phản hồi này.</p>
            </section>
          </aside>
        </div>
        <footer className={styles.source}><SourceNote /></footer>
      </>}
    </PlatformFrame>
  );
}
