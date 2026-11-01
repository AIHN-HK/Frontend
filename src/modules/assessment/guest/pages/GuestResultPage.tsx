import { useSyncExternalStore } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { CountUp } from '@/shared/ui/CountUp';
import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import { RiasecBar } from '@/shared/ui/ce/RiasecBar';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import student from '@/assets/aihn/hero-student.png';
import { riasecCodes } from '../../model/assessment.types';
import { normalizeAssessmentSnapshot, riasecGroups } from '../../results/model/result.model';
import { guestAssessmentStore } from '../model/guest-assessment';
import { useGuestExpiry } from '../model/useGuestExpiry';
import { useResultEntrance } from '../../results/components/useResultEntrance';
import styles from '../../results/pages/AssessmentResultPage.module.css';

export function GuestResultPage() {
  const draft = useSyncExternalStore(guestAssessmentStore.subscribe, guestAssessmentStore.read);
  const result = draft?.result;
  const root = useResultEntrance(result?.id);
  const expired = useGuestExpiry(result?.expiresAt);
  if (!result) return <CareerScreenFrame><div className={styles.content}><h1>Chưa có kết quả trong tab này</h1><p>Bài chưa lưu vào tài khoản. Đóng tab hoặc xóa dữ liệu trình duyệt có thể làm mất bài.</p><Link className="btn btn-primary" to={paths.assessment}>Làm trắc nghiệm</Link></div></CareerScreenFrame>;
  const normalization = normalizeAssessmentSnapshot(result.scores, result.snapshot);
  const dominant = riasecCodes.filter(code => result.topCode.includes(code)).sort((a, b) => result.topCode.indexOf(a) - result.topCode.indexOf(b));
  const destination = (target: 'advisor' | 'roadmap') => `${paths.guestAssessmentClaim}?target=${target}`;
  return <div className={`assessment-result-page ${styles.page}`} ref={root}><CareerScreenFrame><div className={styles.content}>
    <div className={styles.confirmed}><LottieIllustration kind="complete" size={48} /><span>Bài trắc nghiệm đã hoàn thành</span></div>
    <div data-result-enter=""><ShowcaseCard media={<img src={student} alt="Sinh viên AIHN Career · hình minh họa" />} badge="Hình minh họa"><p className={styles['ar-topcode-label']}>Bạn đã hiểu thêm gì về mình?</p><div className={styles['ar-topcode-trio']}>{dominant.map(code => <span data-result-item="" className={styles['ar-topcode-badge']} key={code} style={{ '--trait': `var(--ce-${code.toLowerCase()})`, '--trait-surface': `var(--ce-${code.toLowerCase()}-subtle)`, '--trait-border': `var(--ce-${code.toLowerCase()}-border)` } as CSSProperties}><strong>{code}</strong><small>{riasecGroups[code].name}</small></span>)}</div><h1 className={styles['ar-archetype-title']}>TopCode: {result.topCode}</h1><p className={styles['ar-archetype-desc']}>{normalization.totalQuestions} câu hỏi · Kết quả chưa lưu vào tài khoản.</p><p>Các lựa chọn Có gợi ý điều bạn thích, không đo năng lực hay quyết định nghề.</p></ShowcaseCard></div>
    <section className={styles['ar-scores-section']} aria-label="Sáu nhóm sở thích" data-result-enter=""><h2 className={styles['ar-section-title']}>Điểm sáu nhóm Holland</h2><div className={styles['ar-score-list']}>{riasecCodes.map(code => <RiasecBar key={code} code={code} label={`${code} · ${riasecGroups[code].name}`} percentage={normalization.percentages[code]} valueLabel={`${result.scores[code]}/${normalization.counts[code]} câu Có`} valueContent={<><CountUp value={result.scores[code]} />/{normalization.counts[code]} câu Có</>} />)}</div><RadarChart values={normalization.percentages} /></section>
    <section className={styles.analysis}><h2>Đọc kết quả</h2>{result.analysis.length ? <div className={styles.analysisGrid} style={result.analysis.length === 1 ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>{result.analysis.map(item => <article className={styles.analysisCard} key={item.code}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}{([{ key: 'personality', label: 'Đặc điểm' }, { key: 'strengths', label: 'Thế mạnh' }, { key: 'weaknesses', label: 'Điều nên cân nhắc' }, { key: 'careers', label: 'Nghề tham khảo' }] as const).map(section => <section key={section.key}><h4>{section.label}</h4>{item[section.key].length ? <ul>{item[section.key].map((value, index) => <li key={index}>{value}</li>)}</ul> : <p>Chưa có phần này.</p>}</section>)}</article>)}</div> : <p>Chưa có phần diễn giải. Bạn vẫn xem được điểm sáu nhóm.</p>}</section>
    <section className={styles.bridge} data-result-enter=""><h2>Lưu để xem lại</h2><p>Đăng nhập hoặc đăng ký để lưu kết quả, hỏi AIHN hay tạo lộ trình. Sau đó, bạn sẽ về phần vừa chọn.</p><div className={styles.actions}><Link className={styles.primaryLink} to={destination('advisor')}>Hỏi AIHN</Link><Link className={styles.link} to={destination('roadmap')}>Tạo lộ trình</Link><Link className={styles.link} to={paths.assessment}>Về bài Holland</Link></div></section>
    <p>Bài chưa lưu chỉ được giữ trong tab này. Đóng tab có thể mất bài. {expired ? 'Đã quá hạn lưu bài. Bạn vẫn đọc được kết quả ở đây.' : 'Lưu vào tài khoản trong 24 giờ từ lúc bắt đầu bài.'}</p>
  </div></CareerScreenFrame></div>;
}
