import { useId } from 'react';
import { radarCodes, radarVertices } from './radar.model';
import type { RadarValues } from './radar.model';
import styles from './RadarChart.module.css';

const full: RadarValues = { R:100, I:100, A:100, S:100, E:100, C:100 };
const labels = [[75,10], [133,43], [133,111], [75,145], [17,111], [17,43]] as const;

export function RadarChart({ values, label = 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC' }: { values: RadarValues; label?: string }) {
  const title = useId(), description = useId();
  const complete = radarCodes.every(code => values[code] !== null);
  return <figure className={styles.radar}>
    <svg viewBox="0 0 150 150" role="img" aria-labelledby={title} aria-describedby={description}>
      <title id={title}>{label}</title>
      <desc id={description}>{radarCodes.map(code => `${code}: ${values[code] === null ? 'không có dữ liệu' : `${Math.round(values[code]!)}%`}`).join('; ')}. Không phải xác suất thành công nghề nghiệp.</desc>
      {[1, 2/3, 1/3].map(scale => <polygon key={scale} points={radarVertices(full, 50 * scale)} fill="none" stroke="var(--ce-border)" />)}
      {radarCodes.map((code, index) => <line key={code} x1="75" y1="75" x2={75 + Math.cos(-Math.PI/2 + index*Math.PI/3)*50} y2={75 + Math.sin(-Math.PI/2 + index*Math.PI/3)*50} stroke="var(--ce-border)" />)}
      {complete && <polygon data-radar-values="" points={radarVertices(values)} fill="var(--ce-c-subtle)" stroke="var(--ce-violet)" strokeWidth="1.5" />}
      {radarCodes.map((code, index) => <text key={code} x={labels[index]![0]} y={labels[index]![1]} textAnchor="middle" dominantBaseline="middle" fill={`var(--ce-${code.toLowerCase()})`} fontSize="8" fontWeight="700">{code}</text>)}
    </svg>
    <figcaption>{complete ? 'Tỷ lệ Có theo từng nhóm' : 'Chưa đủ dữ liệu để vẽ toàn bộ biểu đồ'}</figcaption>
  </figure>;
}
