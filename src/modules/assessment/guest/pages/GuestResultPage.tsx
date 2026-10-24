import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { paths } from '@/routes/paths';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { RadarChart } from '@/shared/ui/ce/RadarChart';
import { RiasecBar } from '@/shared/ui/ce/RiasecBar';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import student from '@/assets/aihn/hero-student.png';
import { riasecCodes } from '../../model/assessment.types';
import { normalizeAssessmentSnapshot, riasecGroups } from '../../results/model/result.model';
import { guestAssessmentStore } from '../model/guest-assessment';
import { useGuestExpiry } from '../model/useGuestExpiry';
import styles from '../../results/pages/AssessmentResultPage.module.css';

export function GuestResultPage() {
  const draft = useSyncExternalStore(guestAssessmentStore.subscribe, guestAssessmentStore.read);
  const result = draft?.result;
  const expired = useGuestExpiry(result?.expiresAt);
  if (!result) return <CareerScreenFrame><div className={styles.content}><h1>Chưa có tổng kết RIASEC trong phiên này</h1><p>Bài chưa được lưu vào tài khoản. Đóng tab hoặc xóa dữ liệu trình duyệt có thể làm mất phiên.</p><Link className="btn btn-primary" to={paths.assessment}>Làm hoặc tiếp tục bài Holland</Link></div></CareerScreenFrame>;
  const normalization = normalizeAssessmentSnapshot(result.scores, result.snapshot);
  const destination = (target: 'advisor' | 'roadmap') => `${paths.guestAssessmentClaim}?target=${target}`;
  return <div className={`assessment-result-page ${styles.page}`}><CareerScreenFrame><div className={styles.content}>
    <ShowcaseCard media={<img src={student} alt="Sinh viên AIHN Career · hình minh họa" />} badge="Kết quả của phiên làm bài này"><p className={styles['ar-topcode-label']}>Tổng kết Holland RIASEC</p><h1 className={styles['ar-archetype-title']}>TopCode: {result.topCode}</h1><p className={styles['ar-archetype-desc']}>{normalization.totalQuestions} câu hỏi · Kết quả chưa lưu vào tài khoản.</p><p>Điểm thể hiện các lựa chọn Có của bạn, là gợi ý khám phá sở thích nghề nghiệp.</p></ShowcaseCard>
    <section className={styles['ar-scores-section']} aria-label="Điểm 6 nhóm RIASEC"><h2 className={styles['ar-section-title']}>Điểm số 6 nhóm Holland</h2><div className={styles['ar-score-list']}>{riasecCodes.map(code => <RiasecBar key={code} code={code} label={`${code} · ${riasecGroups[code].name}`} percentage={normalization.percentages[code]} valueLabel={`${result.scores[code]}/${normalization.counts[code]} câu Có`} />)}</div><RadarChart values={normalization.percentages} /></section>
    <section className={styles.analysis}><h2>Hiểu kết quả của bạn</h2>{result.analysis.length ? <div className={styles.analysisGrid}>{result.analysis.map(item => <article className={styles.analysisCard} key={item.code}><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}{([{ key: 'personality', label: 'Đặc điểm' }, { key: 'strengths', label: 'Thế mạnh' }, { key: 'weaknesses', label: 'Điểm cần lưu ý' }, { key: 'careers', label: 'Nghề tham khảo' }] as const).map(section => <section key={section.key}><h4>{section.label}</h4>{item[section.key].length ? <ul>{item[section.key].map((value, index) => <li key={index}>{value}</li>)}</ul> : <p>Chưa có nội dung.</p>}</section>)}</article>)}</div> : <p>Chưa có nội dung phân tích từ hệ thống cho kết quả này. Bạn vẫn có thể xem điểm của cả sáu nhóm.</p>}</section>
    <section className={styles.bridge}><h2>Lưu kết quả và tiếp tục hành trình</h2><p>Đăng ký hoặc đăng nhập để lưu bài vừa làm vào tài khoản, trao đổi với AI và xây dựng lộ trình. Bạn sẽ tiếp tục đúng tính năng đã chọn.</p><div className={styles.actions}><Link className={styles.primaryLink} to={destination('advisor')}>Tư vấn với AI</Link><Link className={styles.link} to={destination('roadmap')}>Xây dựng lộ trình</Link><Link className={styles.link} to={paths.assessment}>Quay lại bài Holland</Link></div></section>
    <p>Phiên chưa lưu chỉ có trong tab này. Đóng tab có thể mất bài. {expired ? 'Phiên đã hết hạn lưu; bạn vẫn có thể đọc kết quả trên màn này.' : 'Hãy lưu vào tài khoản trong vòng 24 giờ kể từ khi bắt đầu.'}</p>
  </div></CareerScreenFrame></div>;
}
