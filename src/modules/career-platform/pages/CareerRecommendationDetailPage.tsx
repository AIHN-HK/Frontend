import { OwnedRiasecSummary } from '@/modules/assessment';
import { Link, useParams, useSearchParams } from 'react-router';
import { paths } from '@/routes/paths';
import { useSession } from '@/shared/session/session';
import { ShowcaseCard } from '@/shared/ui/ce/ShowcaseCard';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import { CountUp } from '@/shared/ui/CountUp';
import { ShinyText } from '@/shared/ui/ShinyText';
import student from '@/assets/aihn/student-male-laptop.jpg';
import { usePlatformQuery } from '../api/platform.api';
import { componentLabels, profileSchema, runSchema } from '../model/contracts';
import { selectRecommendation } from '../model/recommendation-selection';
import { PlatformFrame, ReadState, SourceNote } from '../components/PlatformUI';
import styles from './CareerRecommendationDetailPage.module.css';

export function CareerRecommendationDetailPage() {
  const {recommendationId = ''} = useParams(), [params] = useSearchParams(), current = useSession();
  const valid = /^[A-Za-z0-9_-]{1,160}$/.test(recommendationId);
  const result = usePlatformQuery('recommendations',`/api/v1/career/recommendations/${encodeURIComponent(recommendationId)}`,runSchema.nullable(),true,valid);
  const profile = usePlatformQuery('profile','/api/v1/career/profile',profileSchema,true);
  const run = result.data?.id === recommendationId && result.data.userId === current.user?.id ? result.data : undefined;
  const careerId = params.get('careerId');
  const selected = run && params.getAll('careerId').length <= 1 ? selectRecommendation(run.items,careerId) : null;
  const choose = run && !selected;
  return <PlatformFrame title={selected?.title ?? 'Vì sao nghề này được gợi ý?'} showTitle={!selected} className={styles.page} animationKey={`${recommendationId}:${selected?.careerId ?? ''}`} sidebar={<TimelineSidebar steps={[
    {id:'run',title:'Bản gợi ý',description:'Dựa trên kết quả và hồ sơ',status:run?'completed':'pending'},
    {id:'career',title:'Chi tiết nghề',description:'Xem điểm và kỹ năng cần rèn',status:'active'},
    {id:'target',title:'Chọn mục tiêu',description:'Chọn và lưu trong hồ sơ',status:'pending'},
    {id:'roadmap',title:'Lộ trình',description:'Chia thành từng bước',status:'pending'},
  ]} radar={run ? <OwnedRiasecSummary attemptId={run.attemptId} compact /> : undefined}/> }>
    <nav className={styles.breadcrumb} aria-label="Đường dẫn"><Link to={paths.recommendations}>Nghề phù hợp</Link><span aria-hidden="true">›</span><span>{selected?.title ?? 'Bản gợi ý đã lưu'}</span></nav>
    {!valid ? <p role="alert">Đường dẫn gợi ý chưa đúng.</p> : <ReadState pending={result.isPending} error={result.isError} retry={() => void result.refetch()}/>}
    {valid && result.isSuccess && !run && <p role="alert">Chưa tìm thấy bản gợi ý này.</p>}
    {choose && <section className={styles.chooser}><h2>Chọn nghề để xem lý do</h2>{careerId !== null && <p role="alert">Nghề này không thuộc bản gợi ý hoặc đường dẫn chưa đúng.</p>}{run.items.length ? run.items.map((item,index) => <article key={item.careerId}><h2>{index+1}. {item.title}</h2><p>{item.score===null?'Cần thêm thông tin':`${item.score.toFixed(1)} / 100`}</p><Link to={`${paths.recommendation(run.id)}?careerId=${encodeURIComponent(item.careerId)}`}>Xem lý do gợi ý</Link></article>) : <p>Chưa có nghề nào trong bản gợi ý này.</p>}</section>}
    {run && selected && <>
      <ShowcaseCard className={styles.hero} media={<img src={student} alt="Sinh viên học tập với laptop · ảnh minh họa"/>} badge="Tìm hiểu nghề">
        <p className={styles.overline}><ShinyText>Gợi ý từ kết quả Holland</ShinyText></p>
        <h1 className={styles.heroTitle}>{selected.title}</h1>
        <p>{selected.sourceVersion}</p>
        <div className={styles.rankBadge}><strong className={styles.score}>{selected.score===null?'Cần thêm thông tin':<CountUp value={selected.score} decimals={1} suffix=" / 100" />}</strong><span>Điểm xếp hạng</span></div>
      </ShowcaseCard>
      <dl className={styles.infoRow} data-ce-enter="">
        <div><dt>Điểm RIASEC /100</dt><dd>{selected.components.riasec === null ? 'Chưa đủ thông tin' : selected.components.riasec.toFixed(1)}</dd></div>
        <div><dt>Kỹ năng đã tự đánh giá</dt><dd>{(selected.skillCoverage * 100).toFixed(0)}%</dd></div>
        <div><dt>Hồ sơ dùng để gợi ý</dt><dd>Phiên bản {run.input.profileRevision}</dd></div>
      </dl>
      <section className={styles.section} data-ce-enter=""><h2>Vì sao nghề này xuất hiện?</h2><p>Điểm dùng để so sánh các nghề trong bản gợi ý, không dự đoán thành công.</p><p>Kỹ năng đã tự đánh giá: {(selected.skillCoverage*100).toFixed(0)}%</p><ul>{selected.contributions.map(c => <li key={c.key}>{componentLabels[c.key]}: {c.value.toFixed(1)} × {(c.weight*100).toFixed(1)}% = {c.contribution.toFixed(1)} điểm</li>)}</ul>{selected.missing.length>0 && <p>Thông tin chưa dùng: {selected.missing.map(key=>componentLabels[key as keyof typeof componentLabels]??key).join(', ')}.</p>}</section>
      <section className={styles.section} data-ce-enter=""><h2>Kỹ năng cần rèn khi tạo gợi ý</h2>{selected.gaps.length ? <div className={styles.tableWrap}><table><thead><tr><th>Kỹ năng</th><th>Tự đánh giá</th><th>Mức tham khảo /5</th><th>Khoảng cách</th></tr></thead><tbody>{selected.gaps.map(gap=><tr key={gap.skillId}><td>{gap.skillId}</td><td>{gap.current===null?'Chưa tự đánh giá':gap.current.toFixed(1)}</td><td>{gap.level.toFixed(1)}</td><td>{gap.gap===null?'Chưa xác định':gap.gap.toFixed(1)}</td></tr>)}</tbody></table></div> : <p>Chưa đủ thông tin để so sánh kỹ năng.</p>}<Link to={`${paths.careerProfile}?target=${encodeURIComponent(selected.careerId)}`}>Cập nhật kỹ năng</Link></section>
      <section className={styles.section} data-ce-enter=""><h2>Gợi ý này dựa trên gì?</h2><p>Lần làm #{run.attemptId} · {run.algorithmVersion} · {new Date(run.createdAt).toLocaleString('vi-VN')}</p><p>Dựa trên hồ sơ phiên bản {run.input.profileRevision}{profile.data && profile.data.userId === current.user?.id && profile.data.revision!==run.input.profileRevision?' · Hồ sơ đã thay đổi. Bạn có thể tạo gợi ý mới.':''}</p><p>{selected.sourceVersion}</p><div className={styles.actions}><Link className={styles.primaryLink} to={`${paths.careerProfile}?target=${encodeURIComponent(selected.careerId)}`}>Chọn làm mục tiêu</Link><a href={selected.sourceUrl} target="_blank" rel="noreferrer">Nguồn tham khảo của gợi ý</a><Link to={paths.career(selected.careerId)}>Tìm hiểu thêm</Link><Link to={paths.roadmap}>Xem lộ trình</Link></div></section>
    </>}
    <SourceNote />
  </PlatformFrame>;
}
