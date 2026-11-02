import { OwnedRiasecSummary } from '@/modules/assessment';
import { useSession } from '@/shared/session/session';
import { useState } from 'react';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import styles from './CareerRecommendationsPage.module.css';
import { Link, useParams } from "react-router";
import { useAssessmentHistoryQuery } from "@/modules/assessment";
import { paths } from "@/routes/paths";
import { Button } from "@/shared/ui/ce/Button";
import { CountUp } from '@/shared/ui/CountUp';
import { ShinyText } from '@/shared/ui/ShinyText';
import { SpotlightCard } from '@/shared/ui/SpotlightCard';
import { CareerFitReason } from '../components/CareerFitReason';
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
    <PlatformFrame title="Những nghề nên tìm hiểu thêm" className={styles.page} animationKey={run?.id} sidebar={<TimelineSidebar steps={[
        {id:'result',title:'Holland',description:'Kết quả đầu vào',status:run?'completed':'pending'},
        {id:'recommendations',title:'Gợi ý nghề',description:'Tìm hiểu và so sánh',status:'active'},
        {id:'target',title:'Chọn mục tiêu',description:'Chọn và lưu trong hồ sơ',status:'pending'},
        {id:'roadmap',title:'Lộ trình',description:'Phát triển kỹ năng',status:'pending'},
      ]} radar={run ? <OwnedRiasecSummary attemptId={run.attemptId} compact /> : <p>Xem biểu đồ RIASEC trong kết quả Holland.</p>}/>}>
      <p>
        Gợi ý dựa trên Holland và hồ sơ đã lưu. Điểm giúp so sánh các nghề, không dự đoán thành công.
      </p>
      <ReadState
        pending={result.isPending}
        error={result.isError}
        retry={() => void result.refetch()}
      />
      {!recommendationId && (
        <section className={`platform-card ${styles.createPanel}`}>
          <h2>Dùng kết quả gần nhất</h2>
          {history.isPending ? (
            <p>Đang tải kết quả Holland…</p>
          ) : history.isError ? (
            <p role="alert">
              Chưa tải được kết quả Holland.{" "}
              <Button
                variant="secondary"
                onClick={() => void history.refetch()}
              >
                Tải lại kết quả
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
                <ShinyText>Xem nghề phù hợp</ShinyText>
              </Button>
            </>
          ) : (
            <>
              <p>Làm trắc nghiệm Holland để xem gợi ý nghề.</p>
              <Link to={paths.assessment}>Làm trắc nghiệm</Link>
            </>
          )}
          <Link to={paths.careerProfile}>Cập nhật kỹ năng và mục tiêu</Link>
          <CommandState error={command.error} success={command.isSuccess} />
        </section>
      )}
      <div className={styles.filters} aria-label="Lọc gợi ý">{([['all','Tất cả'],['scored','Có điểm xếp hạng'],['missing','Cần bổ sung dữ liệu']] as const).map(([value,label]) => <Button key={value} variant="secondary" aria-pressed={filter===value} onClick={() => setFilter(value)}>{label}</Button>)}</div>
      {mismatched && <p role="alert">Bản gợi ý này không thuộc tài khoản hoặc đường dẫn đang mở.</p>}
      {run && !run.items.some(item => filter==='all'||(filter==='scored'&&item.score!==null)||(filter==='missing'&&item.missing.length>0)) && <p role="status">Thử mở rộng bộ lọc một chút.</p>}
      {result.isSuccess && !run && !mismatched && <p>Chưa có gợi ý nào. Dùng kết quả Holland để bắt đầu.</p>}
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
          Dựa trên hồ sơ phiên bản {run.input.profileRevision}{" "}
          {currentRevision !== undefined &&
            currentRevision !== run.input.profileRevision &&
            "· Hồ sơ đã thay đổi. Bạn có thể tạo gợi ý mới."}
        </p>
        <Link to={`/recommendations/${run.id}`}>Liên kết bản gợi ý</Link>
      </section>
      <div className={`platform-grid ${styles['rec-grid']}`}>
        {run.items.map((item, index) => (
          (filter==='all'||(filter==='scored'&&item.score!==null)||(filter==='missing'&&item.missing.length>0)) && <SpotlightCard className={`platform-card ${styles['career-card']}`} key={item.careerId}>
            <h2>
              {index === 0 && item.score !== null ? <ShinyText className={styles.featuredTitle}>{index + 1}. {item.title}</ShinyText> : <>{index + 1}. {item.title}</>}
            </h2>
            <p>
              <strong>
                {item.score === null
                  ? "Cần thêm thông tin"
                  : <CountUp value={item.score} decimals={1} suffix=" / 100" />}
              </strong>{" "}
              · điểm xếp hạng
            </p>
            <p>
              Kỹ năng đã tự đánh giá:{" "}
              {(item.skillCoverage * 100).toFixed(0)}%
            </p>
            <CareerFitReason><p>Những tín hiệu có trong bản gợi ý đã lưu:</p><ul>
              {item.contributions.map((c) => (
                <li key={c.key}>
                  {componentLabels[c.key]}: {c.value.toFixed(1)} ×{" "}
                  {(c.weight * 100).toFixed(1)}% = {c.contribution.toFixed(1)}{" "}
                  điểm
                </li>
              ))}
            </ul></CareerFitReason>
            {item.missing.length > 0 && (
              <p>
                Thông tin chưa dùng:{" "}
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
              Tìm hiểu thêm
            </Link>
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">Nguồn tham khảo của gợi ý</a>
            <Link to={`${paths.careerProfile}?target=${item.careerId}`}>
              Chọn làm mục tiêu
            </Link>
            <Link className={styles.detailLink} to={`${paths.recommendation(run.id)}?careerId=${encodeURIComponent(item.careerId)}`}>Xem lý do gợi ý</Link>
            <details>
              <summary>Kỹ năng cần rèn khi tạo gợi ý</summary>
              <ul>
                {item.gaps.map((g) => (
                  <li key={g.skillId}>
                    {g.skillId}:{" "}
                    {g.current === null
                      ? "Chưa tự đánh giá"
                      : `${g.current.toFixed(1)} / mức tham khảo ${g.level.toFixed(1)} · cần rèn thêm ${g.gap?.toFixed(1)}`}
                  </li>
                ))}
              </ul>
            </details>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
