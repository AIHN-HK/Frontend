import type { CSSProperties } from 'react';
import { Button } from 'antd';
import { Link, useParams } from 'react-router';
import { paths } from '@/routes/paths';
import { ApiError } from '@/shared/api/api-error';
import { AsyncState } from '@/shared/ui/AsyncState';
import { CountUp } from '@/shared/ui/CountUp';
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
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
import { useResultEntrance } from '../components/useResultEntrance';
import styles from './AssessmentResultPage.module.css';

const trait = (code: RiasecCode): CSSProperties => ({ '--trait':`var(--ce-${code.toLowerCase()})`, '--trait-surface':`var(--ce-${code.toLowerCase()}-subtle)`, '--trait-border':`var(--ce-${code.toLowerCase()}-border)` } as CSSProperties);
function AnalysisCard({ item, code }: { item: AssessmentAnalysisItem; code?: RiasecCode }) {
  return <article className={styles.analysisCard} style={code ? trait(code) : undefined} data-result-enter="">
    <h3>{item.title}</h3>{item.description && <p>{item.description}</p>}
    {([{ key:'personality',label:'Đặc điểm' },{ key:'strengths',label:'Thế mạnh' },{ key:'weaknesses',label:'Điều nên cân nhắc' },{ key:'careers',label:'Nghề nên tìm hiểu thêm' }] as const).map(section => <section key={section.key}><h4>{section.label}</h4>{item[section.key].length ? <ul>{item[section.key].map((text,index) => <li key={index}>{text}</li>)}</ul> : <p>Chưa có phần này.</p>}</section>)}
  </article>;
}

export function AssessmentResultPage() {
  const { attemptId:rawId } = useParams(), attemptId = parseAttemptId(rawId);
  const result = useAssessmentResultQuery(attemptId), ready = result.isSuccess ? result.data : undefined;
  const snapshot = useAssessmentNormalizationQuery(ready), analysis = useAssessmentAnalysisQuery(ready?.attemptId ?? null);
  const root = useResultEntrance(ready?.attemptId);
  const back = <Link className={styles.link} to={paths.dashboard}>Về Trang của tôi</Link>;
  if (attemptId === null) return <div className={styles.state}><AsyncState state="error" title="Đường dẫn kết quả chưa đúng" description="Kiểm tra đường dẫn hoặc mở kết quả từ lịch sử." action={back}/></div>;
  if (result.isPending) return <div className={styles.state}><AsyncState state="loading" title="Đang tải kết quả…"/></div>;
  if (result.isError || !ready) {
    const missing = result.error instanceof ApiError && (result.error.status === 403 || result.error.status === 404);
    return <div className={styles.state}><AsyncState state="error" title={missing ? 'Không tìm thấy kết quả' : 'Chưa tải được kết quả'} description={missing ? 'Kết quả chưa có hoặc không thuộc tài khoản này.' : 'Chưa đọc được kết quả. Bạn thử lại nhé.'} action={<>{back}<Button onClick={() => void result.refetch()}>Thử lại kết quả</Button></>}/></div>;
  }
  const normalization = snapshot.isSuccess ? snapshot.data : undefined;
  const dominant = ready.topCode.split('') as RiasecCode[];
  const items = analysis.isSuccess ? analysis.data.items : [];
  const cases = items.filter(item => !riasecCodes.some(code => code === item.code));
  const chart = normalization ? <RadarChart values={normalization.percentages}/> : undefined;
  return <div className={`assessment-result-page ${styles.page}`} data-ce-page="result" ref={root}>
    <CareerScreenFrame sidebar={<TimelineSidebar steps={[
      {id:'start',title:'Bắt đầu',description:'Trước khi làm bài',status:'completed'},
      {id:'assessment',title:'Holland',description:'Câu trả lời đã lưu',status:'completed'},
      {id:'result',title:'Kết quả',description:'Sở thích RIASEC',status:'active'},
      {id:'career',title:'Tìm hiểu nghề',description:'Bước tiếp theo',status:'pending'},
      {id:'roadmap',title:'Lộ trình',description:'Mục tiêu phát triển',status:'pending'},
    ]} radar={chart}/> }>
      <div className={styles.content}>
        <div data-result-enter=""><ShowcaseCard media={<img src={student} alt="Sinh viên AIHN Career · ảnh minh họa"/>} badge={dominant.join(' · ')}>
          <div className={styles.confirmed}><LottieIllustration kind="complete" size={48} /><span>Bài trắc nghiệm đã hoàn thành</span></div>
          <p className={styles['ar-topcode-label']}>Kết quả Holland</p>
          <div className={styles['ar-topcode-trio']}>{dominant.map(code => <span data-result-item="" key={code} className={styles['ar-topcode-badge']} style={trait(code)}><strong>{code}</strong><small>{riasecGroups[code].name}</small></span>)}</div>
          <h1 className={styles['ar-archetype-title']}>TopCode: {ready.topCode}</h1>
          <p className={styles['ar-archetype-desc']}>Kết quả đã lưu của lần làm #{ready.attemptId}. Điểm số phản ánh các lựa chọn Có trong từng nhóm.</p>
          <div className={styles.metadata}>{normalization && <span>{normalization.totalQuestions} câu hỏi trong bản ghi lần làm</span>}{analysis.isSuccess && <span>Hoàn thành ngày {analysis.data.finishAt}</span>}</div>
        </ShowcaseCard></div>
        <section className={styles['ar-scores-section']} aria-label="Sáu nhóm sở thích" data-result-enter="">
          <h2 className={styles['ar-section-title']}>Điểm sáu nhóm Holland</h2>
          <div className={styles['ar-score-list']}>{riasecCodes.map(code => {
            const percentage = normalization?.percentages[code] ?? null;
            const label = normalization ? percentage === null ? 'Không có câu hỏi' : `${Math.round(percentage)}% · ${ready.scores[code]}/${normalization.counts[code]} câu Có` : `${ready.scores[code]} điểm`;
            const content = normalization ? percentage === null ? label : <><CountUp value={Math.round(percentage)} suffix="%" /> · {ready.scores[code]}/{normalization.counts[code]} câu Có</> : <CountUp value={ready.scores[code]} suffix=" điểm" />;
            return <RiasecBar key={code} code={code} label={`${riasecGroups[code].name} (${riasecGroups[code].english})`} percentage={percentage} valueLabel={label} valueContent={content}/>;
          })}</div>
        </section>
        {!normalization && <section className={styles.inlineState}>{snapshot.isPending ? <p role="status">Đang chuẩn bị biểu đồ…</p> : <><h2>Chưa hiển thị được biểu đồ</h2><p>Chưa đọc được bộ câu hỏi Có/Không để tính tỷ lệ. Điểm đã lưu vẫn hiển thị bên trên.</p><Button onClick={() => void snapshot.refetch()}>Tải lại biểu đồ</Button></>}</section>}
        {chart && <div className={styles.mobileRadar}>{chart}</div>}
        <section className={styles.analysis}><h2>{cases.length ? 'Góc nhìn từ bài làm' : 'Các nhóm sở thích nổi bật'}</h2>
          {analysis.isPending ? <p role="status">Đang tải phần diễn giải…</p> : analysis.isError ? <div className={styles.inlineState}><p>Chưa tải được phần diễn giải.</p><Button onClick={() => void analysis.refetch()}>Tải lại phần diễn giải</Button></div> : items.length === 0 ? <div className={styles.inlineState}><p>Chưa có phần diễn giải cho bài này.</p><Button onClick={() => void analysis.refetch()}>Tải lại phần diễn giải</Button></div> : <div className={styles.analysisGrid}>{cases.length ? cases.map(item => <AnalysisCard key={item.code} item={item}/>) : dominant.map(code => { const item=items.find(item => item.code === code); return item ? <AnalysisCard key={code} item={item} code={code}/> : <article key={code} className={styles.analysisCard}><h3>{riasecGroups[code].name} ({code})</h3><p>Chưa có nội dung phân tích cho nhóm {code}.</p></article>; })}</div>}
        </section>
        <section className={styles.bridge} data-result-enter=""><h2>Bạn muốn tìm hiểu gì tiếp?</h2><p>Xem nghề được gợi ý hoặc cùng AIHN trao đổi từ kết quả này.</p><div className={styles.actions}><Link className={styles.primaryLink} to={paths.recommendations}>Xem nghề phù hợp</Link><Link className={styles.link} to={paths.careerProfile}>Cập nhật hồ sơ</Link><Link className={styles.link} to={paths.advisor}>Hỏi AIHN</Link></div></section>
        <div className={styles.actions}><Button disabled title="Xuất PDF chưa sẵn sàng">Tải báo cáo PDF</Button>{back}<Link className={styles.link} to={paths.assessment}>Làm trắc nghiệm</Link></div>
      </div>
    </CareerScreenFrame>
  </div>;
}
