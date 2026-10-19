import { Link, useParams } from "react-router";
import { useAssessmentHistoryQuery } from "@/modules/assessment";
import { paths } from "@/routes/paths";
import { Button } from "@/shared/ui/Button";
import { usePlatformCommand, usePlatformQuery } from "../api/platform.api";
import { profileSchema, runSchema, componentLabels } from "../model/contracts";
import type { RecommendationRun } from "../model/contracts";
import {
  PlatformFrame,
  ReadState,
  SourceNote,
  CommandState,
} from "../components/PlatformUI";
export function CareerRecommendationsPage() {
  const { recommendationId } = useParams(),
    history = useAssessmentHistoryQuery(),
    command = usePlatformCommand();
  const result = usePlatformQuery(
    "recommendations",
    recommendationId
      ? `/api/v1/career/recommendations/${encodeURIComponent(recommendationId)}`
      : "/api/v1/career/recommendations/latest",
    runSchema.nullable(),
    true,
  );
  const profile = usePlatformQuery(
    "profile",
    "/api/v1/career/profile",
    profileSchema,
    true,
  );
  const latest = history.data?.[0];
  return (
    <PlatformFrame title="Gợi ý nghề nghiệp có giải thích">
      <SourceNote />
      <p>
        Chỉ số xếp hạng giúp khám phá nghề, không phải xác suất thành công. Cấu
        hình v1 ưu tiên RIASEC 65%, skills 25%, sở thích bổ sung 10%; trọng số
        được chuẩn hóa lại khi thiếu dữ liệu.
      </p>
      <ReadState
        pending={result.isPending}
        error={result.isError}
        retry={() => void result.refetch()}
      />
      {!recommendationId && (
        <section className="platform-card">
          <h2>Tạo gợi ý từ kết quả gần nhất</h2>
          {history.isPending ? (
            <p>Đang đọc kết quả Holland…</p>
          ) : history.isError ? (
            <p role="alert">
              Không đọc được kết quả Holland.{" "}
              <Button
                variant="secondary"
                onClick={() => void history.refetch()}
              >
                Đọc lại kết quả
              </Button>
            </p>
          ) : latest ? (
            <>
              <p>
                Lần làm #{latest.attemptId} · {latest.finishAt}
              </p>
              <Button
                disabled={command.isPending}
                onClick={() =>
                  command.mutate({
                    method: "post",
                    url: "/api/v1/career/recommendations",
                    body: { attemptId: latest.attemptId },
                    schema: runSchema,
                  })
                }
              >
                Tạo gợi ý nghề
              </Button>
            </>
          ) : (
            <>
              <p>Hoàn thành trắc nghiệm Holland để tạo gợi ý cá nhân.</p>
              <Link to={paths.assessment}>Làm trắc nghiệm Holland</Link>
            </>
          )}
          <Link to={paths.careerProfile}>Bổ sung kỹ năng và mục tiêu</Link>
          <CommandState error={command.error} success={command.isSuccess} />
        </section>
      )}
      {result.isSuccess && !result.data && <p>Chưa có bản gợi ý đã lưu.</p>}
      {result.data && (
        <ExplainedRun
          run={result.data}
          currentRevision={profile.data?.revision}
        />
      )}
    </PlatformFrame>
  );
}
function ExplainedRun({
  run,
  currentRevision,
}: {
  run: RecommendationRun;
  currentRevision: number | undefined;
}) {
  return (
    <>
      <section className="platform-card">
        <h2>Bản gợi ý đã lưu</h2>
        <p>
          Lần làm #{run.attemptId} · {run.algorithmVersion} ·{" "}
          {new Date(run.createdAt).toLocaleString("vi-VN")}
        </p>
        <p>
          Hồ sơ đầu vào: phiên bản {run.input.profileRevision}{" "}
          {currentRevision !== undefined &&
            currentRevision !== run.input.profileRevision &&
            "· Hồ sơ đã thay đổi; hãy tạo bản gợi ý mới khi sẵn sàng."}
        </p>
        <Link to={`/recommendations/${run.id}`}>Đường dẫn bản gợi ý này</Link>
      </section>
      <div className="platform-grid">
        {run.items.map((item, index) => (
          <article className="platform-card" key={item.careerId}>
            <h2>
              {index + 1}. {item.title}
            </h2>
            <p>
              <strong>
                {item.score === null
                  ? "Chưa đủ tín hiệu"
                  : `${item.score.toFixed(1)} / 100`}
              </strong>{" "}
              · chỉ số xếp hạng
            </p>
            <p>
              Tỷ lệ kỹ năng có tự đánh giá:{" "}
              {(item.skillCoverage * 100).toFixed(0)}%
            </p>
            <ul>
              {item.contributions.map((c) => (
                <li key={c.key}>
                  {componentLabels[c.key]}: {c.value.toFixed(1)} ×{" "}
                  {(c.weight * 100).toFixed(1)}% = {c.contribution.toFixed(1)}{" "}
                  điểm
                </li>
              ))}
            </ul>
            {item.missing.length > 0 && (
              <p>
                Chưa dùng:{" "}
                {item.missing
                  .map(
                    (k) =>
                      componentLabels[k as keyof typeof componentLabels] ?? k,
                  )
                  .join(", ")}
                .
              </p>
            )}
            <p>{item.sourceVersion}</p>
            <Link to={`/careers/${item.careerId}`}>
              Xem công việc và nguồn nghề
            </Link>
            <Link to={`${paths.careerProfile}?target=${item.careerId}`}>
              Chọn mục tiêu này
            </Link>
            <details>
              <summary>Khoảng cách kỹ năng từ lúc tạo gợi ý</summary>
              <ul>
                {item.gaps.map((g) => (
                  <li key={g.skillId}>
                    {g.skillId}:{" "}
                    {g.current === null
                      ? "Chưa tự đánh giá"
                      : `${g.current.toFixed(1)} / mức tham khảo ${g.level.toFixed(1)} · thiếu ${g.gap?.toFixed(1)}`}
                  </li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </>
  );
}
