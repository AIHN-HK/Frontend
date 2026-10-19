import { Link } from "react-router";
import { paths } from "@/routes/paths";
import { usePlatformQuery } from "../api/platform.api";
import { analyticsSchema, codes } from "../model/contracts";
import { ReadState } from "./PlatformUI";
export function CareerAnalyticsPanel() {
  const result = usePlatformQuery(
    "analytics",
    "/api/v1/career/analytics",
    analyticsSchema,
    true,
  );
  return (
    <section
      className="career-platform"
      aria-label="Phân tích hành trình hướng nghiệp"
    >
      <h2>Phân tích hành trình của bạn</h2>
      <ReadState
        pending={result.isPending}
        error={result.isError}
        retry={() => void result.refetch()}
      />
      {result.data && (
        <>
          <div className="platform-metrics">
            <p>
              <strong>{result.data.counts.assessments}</strong> bài hoàn thành
            </p>
            <p>
              <strong>{result.data.counts.runs}</strong> bản gợi ý đã tạo
            </p>
            <p>
              <strong>{result.data.counts.chats}</strong> phiên tư vấn
            </p>
          </div>
          <Link to={paths.recommendations}>Mở gợi ý nghề có giải thích</Link>
          <Link to={paths.roadmap}>Mở khoảng cách kỹ năng và lộ trình</Link>
          <h3>RIASEC qua các lần làm</h3>
          <p>
            Tỷ lệ Có theo từng nhóm, dùng số câu trong snapshot của chính lần
            làm. Hiển thị tối đa {result.data.timelineLimit} lần gần nhất. Thay
            đổi không đồng nghĩa tốt lên hay kém đi.
          </p>
          {!result.data.timeline.length ? (
            <p>Chưa có kết quả hoàn thành.</p>
          ) : (
            <div className="platform-table-wrap">
              <table className="platform-table">
                <thead>
                  <tr>
                    <th>Lần làm</th>
                    {codes.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.timeline.map((t) => (
                    <tr key={t.attemptId}>
                      <td>
                        <Link to={paths.assessmentResult(t.attemptId)}>
                          #{t.attemptId}
                        </Link>
                        <br />
                        {new Date(t.finishAt).toLocaleDateString("vi-VN")}
                      </td>
                      {codes.map((c) => (
                        <td key={c}>
                          {t.normalized
                            ? `${t.normalized[c].toFixed(1)}%`
                            : "Chưa chuẩn hóa"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.data.delta ? (
            <p>
              Chênh lệch hai lần gần nhất (điểm phần trăm):{" "}
              {codes
                .map(
                  (c) =>
                    `${c}: ${result.data.delta![c] > 0 ? "+" : ""}${result.data.delta![c].toFixed(1)}`,
                )
                .join(" · ")}
            </p>
          ) : (
            <p>
              Cần hai lần làm có snapshot Có/Không hợp lệ để so sánh thay đổi.
            </p>
          )}
          <h3>Tiến độ mục tiêu</h3>
          {result.data.goals.length ? (
            result.data.goals.map((g) => (
              <p key={g.id}>
                {g.title}: {g.completed}/{g.total} nhiệm vụ
              </p>
            ))
          ) : (
            <p>Chưa có mục tiêu đã lưu.</p>
          )}
        </>
      )}
    </section>
  );
}
