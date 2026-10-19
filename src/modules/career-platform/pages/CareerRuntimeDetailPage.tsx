import { Link, useParams } from "react-router";
import { paths } from "@/routes/paths";
import { usePlatformQuery } from "../api/platform.api";
import { careerSchema, codes } from "../model/contracts";
import { PlatformFrame, ReadState, SourceNote } from "../components/PlatformUI";
export function CareerRuntimeDetailPage() {
  const { careerId = "" } = useParams(),
    valid = /^\d{2}-\d{4}\.\d{2}$/.test(careerId);
  const result = usePlatformQuery(
    "career",
    `/api/v1/careers/${encodeURIComponent(careerId)}`,
    careerSchema,
    false,
    valid,
  );
  return (
    <PlatformFrame title={result.data?.title ?? "Chi tiết nghề nghiệp"}>
      <Link to={paths.careers}>Về danh mục nghề</Link>
      {!valid ? (
        <p role="alert">Mã nghề không hợp lệ.</p>
      ) : (
        <ReadState
          pending={result.isPending}
          error={result.isError}
          retry={() => void result.refetch()}
        />
      )}
      {result.data && (
        <>
          <p>{result.data.description}</p>
          <p>
            {result.data.id} · {result.data.sourceVersion}
          </p>
          <SourceNote />
          <a href={result.data.sourceUrl} target="_blank" rel="noreferrer">
            Đọc nguồn nghề gốc
          </a>
          <section className="platform-card">
            <h2>Hồ sơ sở thích nghề (1–7)</h2>
            <p>
              {codes.map((c) => `${c}: ${result.data.riasec[c]}`).join(" · ")}
            </p>
          </section>
          <section className="platform-card">
            <h2>Kỹ năng tham khảo</h2>
            {!result.data.skills.length ? (
              <p>Chưa có dữ liệu kỹ năng.</p>
            ) : (
              <div className="platform-table-wrap">
                <table className="platform-table">
                  <thead>
                    <tr>
                      <th>Kỹ năng</th>
                      <th>Tầm quan trọng /5</th>
                      <th>Mức yêu cầu /5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.skills.map((s) => (
                      <tr key={s.skillId}>
                        <td>{s.skill.name}</td>
                        <td>{s.importance.toFixed(2)}</td>
                        <td>{s.level.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p>
              Mức yêu cầu được quy đổi từ thang O*NET; tự đánh giá cùng thang
              chỉ mang tính tham khảo.
            </p>
          </section>
          <Link
            className="btn btn-primary"
            to={`${paths.careerProfile}?target=${careerId}`}
          >
            Chọn làm mục tiêu trong hồ sơ
          </Link>
          <Link to={`${paths.recommendations}?career=${careerId}`}>
            Xem gợi ý cá nhân và khoảng cách kỹ năng
          </Link>
        </>
      )}
    </PlatformFrame>
  );
}
