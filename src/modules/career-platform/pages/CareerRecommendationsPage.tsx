import { OwnedRiasecSummary } from '@/modules/assessment';
import { useSession } from '@/shared/session/session';
import { useState } from 'react';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import styles from './CareerRecommendationsPage.module.css';
import { Link, useParams } from "react-router";
import { useAssessmentHistoryQuery } from "@/modules/assessment";
import { paths } from "@/routes/paths";
import { Button } from "@/shared/ui/ce/Button";
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
  const [filter,setFilter] = useState<'all'|'scored'|'missing'>('all');
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
  const current = useSession();
  const run = result.data && result.data.userId === current.user?.id && (!recommendationId || result.data.id === recommendationId) ? result.data : null;
  const mismatched = Boolean(result.data && !run);
  return (
    <PlatformFrame title="Gợi ý nghề nghiệp có giải thích" className={styles.page} animationKey={run?.id} sidebar={<TimelineSidebar steps={[
        {id:'result',title:'Holland',description:'Kết quả đầu vào',status:run?'completed':'pending'},
        {id:'recommendations',title:'Gợi ý nghề',description:'Khám phá và so sánh',status:'active'},
        {id:'target',title:'Chọn mục tiêu',description:'Lưu chủ động trong hồ sơ',status:'pending'},
        {id:'roadmap',title:'Lộ trình',description:'Phát triển kỹ năng',status:'pending'},
      ]} radar={run ? <OwnedRiasecSummary attemptId={run.attemptId} compact /> : <p>Bản đồ RIASEC sẽ có trong kết quả Holland đã lưu.</p>}/>}>
      <p>
        Khám phá nghề từ kết quả Holland và hồ sơ đã lưu của bạn. Điểm xếp
        hạng giúp so sánh các nghề, không phải xác suất thành công.
      </p>
      <ReadState
        pending={result.isPending}
        error={result.isError}
        retry={() => void result.refetch()}
      />
      {!recommendationId && (
        <section className={`platform-card ${styles.createPanel}`}>
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
      <div className={styles.filters} aria-label="Lọc bản gợi ý">{([['all','Tất cả'],['scored','Có điểm xếp hạng'],['missing','Cần bổ sung dữ liệu']] as const).map(([value,label]) => <Button key={value} variant="secondary" aria-pressed={filter===value} onClick={() => setFilter(value)}>{label}</Button>)}</div>
      {mismatched && <p role="alert">Bản gợi ý không khớp tài khoản hoặc mã được yêu cầu.</p>}
      {run && !run.items.some(item => filter==='all'||(filter==='scored'&&item.score!==null)||(filter==='missing'&&item.missing.length>0)) && <p role="status">Không có gợi ý phù hợp với bộ lọc này.</p>}
      {result.isSuccess && !run && !mismatched && <p>Chưa có bản gợi ý đã lưu.</p>}
      {run && (
        <ExplainedRun
          run={run}
          currentRevision={profile.data?.revision}
          filter={filter}
        />
      )}
      <footer className={styles.sourceFooter}><SourceNote /></footer>
    </PlatformFrame>
  );
}
function ExplainedRun({
  run,
  currentRevision,
  filter,
}: {
  run: RecommendationRun;
  currentRevision: number | undefined;
  filter: 'all'|'scored'|'missing';
}) {
  return (
    <>
      <section className={`platform-card ${styles.runSummary}`}>
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
      <div className={`platform-grid ${styles['rec-grid']}`}>
        {run.items.map((item, index) => (
          (filter==='all'||(filter==='scored'&&item.score!==null)||(filter==='missing'&&item.missing.length>0)) && <article className={`platform-card ${styles['career-card']}`} key={item.careerId}>
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
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">Nguồn nghề của bản gợi ý</a>
            <Link to={`${paths.careerProfile}?target=${item.careerId}`}>
              Chọn mục tiêu này
            </Link>
            <Link className={styles.detailLink} to={`${paths.recommendation(run.id)}?careerId=${encodeURIComponent(item.careerId)}`}>Xem gợi ý nghề này</Link>
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
