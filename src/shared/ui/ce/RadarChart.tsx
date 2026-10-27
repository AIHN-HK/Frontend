import { useId, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { radarCodes, radarVertices } from './radar.model';
import type { RadarValues } from './radar.model';
import styles from './RadarChart.module.css';

const full: RadarValues = { R:100, I:100, A:100, S:100, E:100, C:100 };
const labels = [[75,10], [133,43], [133,111], [75,145], [17,111], [17,43]] as const;

export function RadarChart({ values, label = 'Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC', showPartial = false }: { values: RadarValues; label?: string; showPartial?: boolean }) {
  const title = useId(), description = useId();
  const complete = radarCodes.every(code => values[code] !== null);
  const shape = useRef<SVGPolygonElement>(null);
  const points = complete ? radarVertices(values) : null;
  const observed = showPartial ? radarVertices(values).split(' ') : [];
  const hasAnswers = radarCodes.some(code => values[code] !== null);
  useLayoutEffect(() => {
    const node = shape.current;
    if (!node || points === null) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let tween: gsap.core.Tween | undefined, started = false;
      const start = () => {
        if (started) return;
        started = true;
        tween = gsap.fromTo(node, { attr: { points: Array(6).fill('75,75').join(' ') } }, { attr: { points }, duration: .45, ease: 'power2.out' });
      };
      const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); start(); }
      });
      if (observer) observer.observe(node); else start();
      return () => { observer?.disconnect(); tween?.kill(); node.setAttribute('points', points); };
    }, shape);
    return () => { media.revert(); node.setAttribute('points', points); };
  }, [points]);
  return <figure className={styles.radar}>
    <svg viewBox="0 0 150 150" role="img" aria-labelledby={title} aria-describedby={description}>
      <title id={title}>{label}</title>
      <desc id={description}>{radarCodes.map(code => `${code}: ${values[code] === null ? 'không có dữ liệu' : `${Math.round(values[code]!)}%`}`).join('; ')}. Không phải xác suất thành công nghề nghiệp.</desc>
      {[1, 2/3, 1/3].map(scale => <polygon key={scale} points={radarVertices(full, 50 * scale)} fill="none" stroke="var(--ce-border)" />)}
      {radarCodes.map((code, index) => <line key={code} x1="75" y1="75" x2={75 + Math.cos(-Math.PI/2 + index*Math.PI/3)*50} y2={75 + Math.sin(-Math.PI/2 + index*Math.PI/3)*50} stroke="var(--ce-border)" />)}
      {points && <polygon ref={shape} data-radar-values="" points={points} fill="var(--ce-c-subtle)" stroke="var(--ce-violet)" strokeWidth="1.5" />}
      {showPartial && radarCodes.map((code, index) => {
        if (values[code] === null) return null;
        const [cx, cy] = observed[index]!.split(',').map(Number);
        return <g key={code} fill={`var(--ce-${code.toLowerCase()})`} stroke={`var(--ce-${code.toLowerCase()})`}>
          {!complete && <line x1="75" y1="75" x2={cx} y2={cy} strokeWidth="1.5" opacity=".65" />}
          <circle data-radar-observed={code} cx={cx} cy={cy} r="2.5" strokeWidth="1" />
        </g>;
      })}
      {radarCodes.map((code, index) => <text key={code} x={labels[index]![0]} y={labels[index]![1]} textAnchor="middle" dominantBaseline="middle" fill={`var(--ce-${code.toLowerCase()})`} fontSize="8" fontWeight="700">{code}</text>)}
    </svg>
    <figcaption>{complete ? 'Tỷ lệ Có theo từng nhóm' : showPartial ? hasAnswers ? 'Nhóm chưa trả lời được để trống' : 'Trả lời câu hỏi để cập nhật biểu đồ' : 'Chưa đủ dữ liệu để vẽ toàn bộ biểu đồ'}</figcaption>
  </figure>;
}
