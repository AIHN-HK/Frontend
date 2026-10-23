import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Button } from 'antd';
import { Link, useParams } from 'react-router';
import gsap from 'gsap';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { AsyncState } from '@/shared/ui/AsyncState';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import { RiasecBar } from '@/shared/ui/ce/RiasecBar';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import student from '@/assets/aihn/hero-student.png';
import { useAssessmentAnalysisQuery, useAssessmentNormalizationQuery, useAssessmentResultQuery } from '../../queries/assessment.queries';
import { riasecCodes } from '../../model/assessment.types';
import type { AssessmentAnalysisItem, RiasecCode } from '../../model/assessment.types';
import { parseAttemptId, riasecGroups } from '../model/result.model';
import styles from './AssessmentResultPage.module.css';

const trait = (code: RiasecCode): CSSProperties => ({ '--trait':`var(--ce-${code.toLowerCase()})`, '--trait-surface':`var(--ce-${code.toLowerCase()}-subtle)`, '--trait-border':`var(--ce-${code.toLowerCase()}-border)` } as CSSProperties);
function AnalysisCard({ item, code }: { item: AssessmentAnalysisItem; code?: RiasecCode }) {
  return <article className={styles.analysisCard} style={code ? trait(code) : undefined}>
    <h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
    {([{ key:'personality',label:'Đặc điểm' },{ key:'strengths',label:'Thế mạnh' },{ key:'weaknesses',label:'Điểm cần lưu ý' },{ key:'careers',label:'Nghề tham khảo từ nội dung phân tích' }] as const).map(section => <section key={section.key}><h4>{section.label}</h4>{item[section.key].length ? <ul>{item[section.key].map((text,index) => <li key={index}>{text}</li>)}</ul> : <p>Chưa có nội dung.</p>}</section>)}
  </article>;
}

export function AssessmentResultPage() {
  const { attemptId:rawId } = useParams(), attemptId = parseAttemptId(rawId);
  const result = useAssessmentResultQuery(attemptId), ready = result.isSuccess ? result.data : undefined;
  const snapshot = useAssessmentNormalizationQuery(ready), analysis = useAssessmentAnalysisQuery(ready?.attemptId ?? null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-ce-enter]',{ opacity:0,y:24,duration:.65,stagger:.1,ease:'power3.out' });
      });
    },root);
    return () => ctx.revert();
  },[ready?.attemptId]);
  const back = <Link className={styles.link} to={paths.dashboard}>Về Trang của tôi</Link>;
  if (attemptId === null) return <div className={styles.state}><AsyncState state="error" title="Mã lần làm không hợp lệ" description="Đường dẫn cần mã lần làm là số nguyên dương hợp lệ." action={back}/></div>;
  if (result.isPending) return <div className={styles.state}><AsyncState state="loading" title="Đang tải kết quả…"/></div>;
  if (result.isError || !ready) {
    const missing = result.error instanceof ApiError && (result.error.status === 403 || result.error.status === 404);
    return <div className={styles.state}><AsyncState state="error" title={missing ? 'Không tìm thấy kết quả' : 'Không tải được kết quả'} description={missing ? 'Lần làm chưa có kết quả, không tồn tại hoặc bạn không có quyền xem.' : 'Dữ liệu kết quả chưa được xác nhận. Vui lòng thử lại.'} action={<>{back}<Button onClick={() => void result.refetch()}>Thử lại kết quả</Button></>}/></div>;
  }
  const normalization = snapshot.isSuccess ? snapshot.data : undefined;
  const dominant = ready.topCode.split('') as RiasecCode[];
  const items = analysis.isSuccess ? analysis.data.items : [];
  const cases = items.filter(item => !riasecCodes.some(code => code === item.code));
  const chart = normalization ? <RadarChart values={normalization.percentages}/> : undefined;
  return <div className={`assessment-result-page ${styles.page}`} data-ce-page="result" ref={root}>
    <CareerScreenFrame sidebar={<TimelineSidebar steps={[
      {id:'start',title:'Start',description:'Giới thiệu & Chuẩn bị',status:'completed'},
      {id:'assessment',title:'Holland',description:'Lựa chọn đã lưu',status:'completed'},
      {id:'result',title:'Kết quả',description:'Hồ sơ RIASEC',status:'active'},
      {id:'career',title:'Khám phá nghề',description:'Bước tiếp theo',status:'pending'},
      {id:'roadmap',title:'Lộ trình',description:'Mục tiêu phát triển',status:'pending'},
    ]} radar={chart}/> }>
      <div className={styles.content}>
        <ShowcaseCard media={<img src={student} alt="Sinh viên AIHN Career · ảnh minh họa"/>} badge={dominant.join(' · ')}>
          <p className={styles['ar-topcode-label']}>TopCode Kết quả</p>
          <div className={styles['ar-topcode-trio']}>{dominant.map(code => <span key={code} className={styles['ar-topcode-badge']} style={trait(code)}><strong>{code}</strong><small>{riasecGroups[code].name}</small></span>)}</div>
          <h1 className={styles['ar-archetype-title']}>TopCode: {ready.topCode}</h1>
          <p className={styles['ar-archetype-desc']}>Kết quả đã lưu của lần làm #{ready.attemptId}. Điểm số phản ánh các lựa chọn Có trong từng nhóm.</p>
          <div className={styles.metadata}>{normalization && <span>{normalization.totalQuestions} câu hỏi trong bản ghi lần làm</span>}{analysis.isSuccess && <span>Hoàn thành ngày {analysis.data.finishAt}</span>}</div>
        </ShowcaseCard>
        <section className={styles['ar-scores-section']} aria-label="Điểm 6 nhóm RIASEC" data-ce-enter="">
          <h2 className={styles['ar-section-title']}>Điểm số 6 nhóm Holland</h2>
          <div className={styles['ar-score-list']}>{riasecCodes.map(code => {
            const percentage = normalization?.percentages[code] ?? null;
            const label = normalization ? percentage === null ? 'Không có câu hỏi' : `${Math.round(percentage)}% · ${ready.scores[code]}/${normalization.counts[code]} câu Có` : `${ready.scores[code]} điểm`;
            return <RiasecBar key={code} code={code} label={`${riasecGroups[code].name} (${riasecGroups[code].english})`} percentage={percentage} valueLabel={label}/>;
          })}</div>
        </section>
        {!normalization && <section className={styles.inlineState}>{snapshot.isPending ? <p role="status">Đang đọc bản ghi để chuẩn hóa biểu đồ…</p> : <><h2>Chưa thể chuẩn hóa biểu đồ</h2><p>Chưa có bản ghi Có/Không hợp lệ của lần làm này. Điểm đã lưu vẫn được hiển thị; tỷ lệ chưa được xác nhận.</p><Button onClick={() => void snapshot.refetch()}>Thử lại bản ghi lần làm</Button></>}</section>}
        {chart && <div className={styles.mobileRadar}>{chart}</div>}
        <div className={styles.actions}><Link className={styles.primaryLink} to={paths.recommendations}>Xem gợi ý nghề nghiệp</Link><Button disabled title="Xuất PDF chưa sẵn sàng">Tải báo cáo PDF</Button>{back}<Link className={styles.link} to={paths.assessment}>Làm bài trắc nghiệm</Link></div>
        <section className={styles.analysis}><h2>{cases.length ? 'Phân tích tổng hợp của lần làm' : 'Phân tích các nhóm trong mã TopCode'}</h2>
          {analysis.isPending ? <p role="status">Đang tải phân tích…</p> : analysis.isError ? <div className={styles.inlineState}><p>Không tải được phân tích.</p><Button onClick={() => void analysis.refetch()}>Thử lại phân tích</Button></div> : items.length === 0 ? <div className={styles.inlineState}><p>Chưa có nội dung phân tích cho lần làm này.</p><Button onClick={() => void analysis.refetch()}>Thử lại phân tích</Button></div> : <div className={styles.analysisGrid}>{cases.length ? cases.map(item => <AnalysisCard key={item.code} item={item}/>) : dominant.map(code => { const item=items.find(item => item.code === code); return item ? <AnalysisCard key={code} item={item} code={code}/> : <article key={code} className={styles.analysisCard}><h3>{riasecGroups[code].name} ({code})</h3><p>Chưa có nội dung phân tích cho nhóm {code}.</p></article>; })}</div>}
        </section>
        <section className={styles.bridge}><h2>Từ kết quả Holland đến định hướng nghề nghiệp</h2><p>Tạo gợi ý nghề có giải thích hoặc trao đổi với cố vấn từ kết quả đã lưu.</p><div className={styles.actions}><Link className={styles.link} to={paths.careerProfile}>Cập nhật hồ sơ cá nhân</Link><Link className={styles.link} to={paths.advisor}>Trao đổi với Cố vấn AI</Link></div></section>
      </div>
    </CareerScreenFrame>
  </div>;
}
