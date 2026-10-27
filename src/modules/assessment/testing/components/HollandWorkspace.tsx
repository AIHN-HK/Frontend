import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { TimelineSidebar } from '@/shared/ui/ce/TimelineSidebar';
import styles from './HollandWorkspace.module.css';

export function HollandWorkspace({ children, radar, started, stage = 'test' }: { children: ReactNode; radar?: ReactNode; started: boolean; stage?: 'test' | 'processing' | 'complete' }) {
  const background = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sync = () => { if (background.current) background.current.dataset.paused = String(document.hidden); };
    sync(); document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);
  return <div className={styles.workspace}>
    <div ref={background} className={styles.atmosphere} data-holland-atmosphere="" aria-hidden="true">
      <div className={styles.wash} />
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor"><ellipse cx="760" cy="490" rx="530" ry="250" transform="rotate(-28 760 490)" /><ellipse cx="760" cy="490" rx="570" ry="295" transform="rotate(-28 760 490)" /><ellipse cx="760" cy="490" rx="615" ry="340" transform="rotate(-28 760 490)" /></g></svg>
    </div>
    <CareerScreenFrame layout="assessment" sidebar={<TimelineSidebar compact title="Lộ trình trắc nghiệm" steps={[
      { id: 'test', title: 'Làm trắc nghiệm', description: started ? 'Chọn theo cảm nhận của bạn' : 'Sẵn sàng khám phá bản thân', status: stage === 'test' ? 'active' : 'completed' },
      { id: 'complete', title: 'Hoàn thành', description: 'Kiểm tra và nộp bài', status: stage === 'processing' ? 'active' : stage === 'complete' ? 'completed' : 'pending' },
      { id: 'result', title: 'Xem kết quả', description: 'Hiểu các nhóm sở thích', status: stage === 'complete' ? 'active' : 'pending' },
    ]} radarTitle={radar ? 'RIASEC tạm thời' : 'Khám phá RIASEC'} radar={radar ?? <RiasecCompass />} />}>{children}</CareerScreenFrame>
  </div>;
}

function RiasecCompass() {
  const points = [[100, 32], [159, 66], [159, 134], [100, 168], [41, 134], [41, 66]] as const;
  return <><svg viewBox="0 0 200 200" role="img" aria-label="Sáu nhóm sở thích RIASEC, hình minh họa không phải điểm số">
    <circle cx="100" cy="100" r="68" fill="none" stroke="var(--ce-border)" />
    <path d="M100 32 159 66 159 134 100 168 41 134 41 66Z" fill="var(--ce-c-subtle)" stroke="var(--ce-c-border)" />
    {['R', 'I', 'A', 'S', 'E', 'C'].map((code, index) => <g key={code}><line x1="100" y1="100" x2={points[index]![0]} y2={points[index]![1]} stroke="var(--ce-border)" /><circle cx={points[index]![0]} cy={points[index]![1]} r="15" fill="var(--ce-card-gradient-start)" stroke={`var(--ce-${code.toLowerCase()}-border)`} /><text x={points[index]![0]} y={points[index]![1] + 4} textAnchor="middle" fill={`var(--ce-${code.toLowerCase()})`} fontSize="12" fontWeight="600">{code}</text></g>)}
    <circle cx="100" cy="100" r="5" fill="var(--ce-violet)" />
  </svg><p className={styles.caption}>Mỗi lựa chọn giúp bạn hiểu thêm điều mình yêu thích.</p></>;
}
