import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router";
import gsap from "gsap";
import { paths } from "@/routes/paths";
import { ApiError } from "@/shared/api/api-error";
import { Button } from "@/shared/ui/Button";
import { AsyncState } from "@/shared/ui/AsyncState";
import { useAssessmentAnalysisQuery, useAssessmentNormalizationQuery, useAssessmentResultQuery } from "../../queries/assessment.queries";
import { riasecCodes } from "../../model/assessment.types";
import type { AssessmentAnalysisItem, AssessmentNormalization, AssessmentScores, RiasecCode } from "../../model/assessment.types";
import { parseAttemptId, riasecGroups } from "../model/result.model";
import { RiasecRadar } from "../components/RiasecRadar";
import "./result.css";

const color = (code: RiasecCode): CSSProperties => ({ "--trait-color": `var(--riasec-${code.toLowerCase()})`, "--trait-surface": `var(--riasec-${code.toLowerCase()}-subtle)`, "--trait-border": `var(--riasec-${code.toLowerCase()}-border)` } as CSSProperties);
function Score({ code, scores, normalization }: { code: RiasecCode; scores: AssessmentScores; normalization?: AssessmentNormalization }) {
  if (!normalization) return <>{scores[code]} điểm</>;
  const percentage = normalization.percentages[code];
  return <>{percentage === null ? "Không có câu hỏi" : `${Math.round(percentage)}% · ${scores[code]}/${normalization.counts[code]} câu Có`}</>;
}
function AnalysisCard({ item, code }: { item: AssessmentAnalysisItem; code?: RiasecCode }) {
  return <article className="result-trait-card" style={code ? color(code) : undefined}>
    <div className="result-trait-heading"><h3>{item.title}</h3><span className="result-tag">{code ? `Nhóm ${code}` : "Phân tích tổng hợp"}</span></div>
    {item.description && <p className="result-analysis-description">{item.description}</p>}
    {([{ key: "personality", label: "Đặc điểm" }, { key: "strengths", label: "Thế mạnh" }, { key: "weaknesses", label: "Điểm cần lưu ý" }, { key: "careers", label: "Nghề tham khảo từ nội dung phân tích" }] as const).map(section => <section className="result-trait-block" key={section.key}><h4>{section.label}</h4>{item[section.key].length ? <ul>{item[section.key].map((text, index) => <li key={index}>{text}</li>)}</ul> : <p>Chưa có nội dung.</p>}</section>)}
  </article>;
}

export function AssessmentResultPage() {
  const { attemptId: rawId } = useParams(), attemptId = parseAttemptId(rawId);
  const result = useAssessmentResultQuery(attemptId), ready = result.isSuccess ? result.data : undefined;
  const snapshot = useAssessmentNormalizationQuery(ready), analysis = useAssessmentAnalysisQuery(ready?.attemptId ?? null);
  const back = <Link className="btn btn-secondary" to={paths.dashboard}>Về Trang của tôi</Link>;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add({ noPreference: "(prefers-reduced-motion: no-preference)" }, () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.6 } });
        tl.from(".result-hero", { y: 15, autoAlpha: 0 })
          .from(".result-showcase", { y: 20, autoAlpha: 0 }, "-=0.2")
          .from(".result-trait-card", { y: 20, autoAlpha: 0, stagger: 0.1 }, "-=0.3")
          .from(".match-pipeline-card", { y: 15, autoAlpha: 0 }, "-=0.2");
      });
    }, containerRef);
    return () => ctx.revert();
  }, [ready]);

  if (attemptId === null) return <div className="assessment-result-page"><AsyncState state="error" title="Mã lần làm không hợp lệ" description="Đường dẫn cần mã lần làm là số nguyên dương hợp lệ." action={back} /></div>;
  if (result.isPending) return <div className="assessment-result-page"><AsyncState state="loading" title="Đang tải kết quả…" /></div>;
  if (result.isError || !ready) {
    const missing = result.error instanceof ApiError && (result.error.status === 403 || result.error.status === 404);
    return <div className="assessment-result-page"><AsyncState state="error" title={missing ? "Không tìm thấy kết quả" : "Không tải được kết quả"} description={missing ? "Lần làm chưa có kết quả, không tồn tại hoặc bạn không có quyền xem." : "Dữ liệu kết quả chưa được xác nhận. Vui lòng thử lại."} action={<>{back}<Button onClick={() => { void result.refetch(); }}>Thử lại kết quả</Button></>} /></div>;
  }
  const normalization = snapshot.isSuccess ? snapshot.data : undefined;
  const dominant = ready.topCode.split("") as RiasecCode[], secondary = ready.ranked.filter(item => !dominant.includes(item.type));
  const items = analysis.isSuccess ? analysis.data.items : [], cases = items.filter(item => !riasecCodes.some(code => code === item.code));

  return <div className="assessment-result-page" ref={containerRef}>
    <nav className="result-actions" aria-label="Điều hướng kết quả">{back}<Link className="btn btn-secondary" to={paths.assessment}>Làm bài trắc nghiệm</Link></nav>
    <header className="result-friendly-header"><span className="result-header-tag">Khám phá tiềm năng bản thân</span><h1>Kết quả Định hướng Holland RIASEC</h1><p>Kết quả đã lưu của lần làm #{ready.attemptId}. Điểm số phản ánh các lựa chọn của bạn trong lần làm này.</p></header>
    <section className="result-hero" aria-label="Mã Holland đã lưu">
      <div className="result-hero-top"><div className="result-topcode"><span className="result-caption">Mã trắc nghiệm của bạn</span><div className="result-topcode-badge"><strong>TopCode: {ready.topCode}</strong>{dominant.map(code => <span key={code} className="result-tag" style={color(code)}>{code} — {riasecGroups[code].name}</span>)}</div></div>
        <div className="result-metadata"><span>Lần làm #{ready.attemptId}</span>{normalization && <span>{normalization.totalQuestions} câu hỏi trong bản ghi lần làm</span>}{analysis.isSuccess && <span>Hoàn thành ngày {analysis.data.finishAt}</span>}</div>
      </div>
      <p className="result-summary">Điểm mỗi nhóm là số lựa chọn Có. Mã TopCode do hệ thống trả về từ điểm đã lưu; tỷ lệ trên biểu đồ cho biết số lựa chọn Có trên số câu hỏi của từng nhóm.</p>
    </section>
    <section className="result-section" aria-labelledby="result-map-title"><div className="result-section-heading"><div><h2 id="result-map-title">Bản đồ 6 nhóm sở thích nghề nghiệp RIASEC</h2><p>Tỷ lệ được tính từ bộ câu hỏi đã lưu của chính lần làm này.</p></div>{normalization && <span>Tỷ lệ Có: 0–100%</span>}</div>
      <div className="result-showcase"><div className="result-chart-panel">{normalization ? <RiasecRadar percentages={normalization.percentages} /> : snapshot.isPending ? <p role="status">Đang đọc bản ghi để chuẩn hóa biểu đồ…</p> : <div className="result-inline-state"><h3>Chưa thể chuẩn hóa biểu đồ</h3><p>Chưa có bản ghi Có/Không hợp lệ của lần làm này. Điểm đã lưu vẫn được hiển thị; tỷ lệ chưa được xác nhận.</p><Button variant="secondary" onClick={() => { void snapshot.refetch(); }}>Thử lại bản ghi lần làm</Button></div>}</div>
        <section className="result-bars" aria-label="Điểm 6 nhóm RIASEC">{ready.ranked.map(item => <div className="result-bar-item" key={item.type} style={color(item.type)}><div className="result-bar-heading"><span className="result-bar-label"><span className="result-dot" aria-hidden="true" /><strong>{riasecGroups[item.type].name} ({riasecGroups[item.type].english})</strong></span><span className="result-bar-score"><Score code={item.type} scores={ready.scores} normalization={normalization} /></span></div>{normalization && <div className="result-bar-track" aria-hidden="true"><span style={{ width: `${normalization.percentages[item.type] ?? 0}%` }} /></div>}</div>)}</section>
      </div>
    </section>
    <section className="result-section" aria-labelledby="result-analysis-title"><div className="result-section-heading"><div><h2 id="result-analysis-title">{cases.length ? "Phân tích tổng hợp của lần làm" : "Phân tích các nhóm trong mã TopCode"}</h2><p>Nội dung do hệ thống phân tích Holland trả về.</p></div></div>
      {analysis.isPending ? <p role="status" className="result-inline-state">Đang tải phân tích…</p> : analysis.isError ? <div className="result-inline-state" role="status"><p>Không tải được phân tích.</p><Button variant="secondary" onClick={() => { void analysis.refetch(); }}>Thử lại phân tích</Button></div> : items.length === 0 ? <div className="result-inline-state"><p>Chưa có nội dung phân tích cho lần làm này.</p><Button variant="secondary" onClick={() => { void analysis.refetch(); }}>Thử lại phân tích</Button></div> : <div className={`result-dominant-grid${cases.length ? " result-case-grid" : ""}`}>{cases.length ? cases.map(item => <AnalysisCard key={item.code} item={item} />) : dominant.map(code => {
        const item = items.find(item => item.code === code);
        return item ? <AnalysisCard key={code} item={item} code={code} /> : <article key={code} className="result-trait-card" style={color(code)}><h3>{riasecGroups[code].name} ({code})</h3><p>Chưa có nội dung phân tích cho nhóm {code}.</p></article>;
      })}</div>}
    </section>
    <section className="result-section" aria-labelledby="result-secondary-title"><h2 id="result-secondary-title">Các nhóm còn lại</h2><div className="result-secondary-grid">{secondary.map(item => <article className="result-secondary-card" key={item.type} style={color(item.type)}><div className="result-trait-heading"><span className="result-tag">{item.type} — {riasecGroups[item.type].name}</span><strong className="result-bar-score"><Score code={item.type} scores={ready.scores} normalization={normalization} /></strong></div><p>Điểm số phản ánh các lựa chọn trong lần làm này.</p></article>)}</div></section>
    
    <section className="result-bridge"><div><span className="result-header-tag">Bước tiếp theo</span><h2>Từ kết quả Holland đến định hướng nghề nghiệp</h2><p>Tạo gợi ý nghề có giải thích hoặc trao đổi với cố vấn từ kết quả đã lưu.</p><p>Bạn có thể cập nhật hồ sơ cá nhân và xem lại kết quả đã lưu.</p></div><Link className="btn btn-secondary" to={paths.careerProfile}>Cập nhật hồ sơ cá nhân</Link><Link className="btn btn-primary" to={paths.recommendations}>Xem gợi ý nghề</Link><Link className="btn btn-secondary" to={paths.advisor}>Trao đổi với Cố vấn AI</Link></section>
  </div>;
}
