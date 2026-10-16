import { useId } from 'react';
import { riasecCodes } from '../../model/assessment.types';
import type { AssessmentPercentages } from '../../model/assessment.types';
import { radarPoint, radarPoints } from '../model/result.model';

const labels = [
  { x: 180, y: 48, anchor: 'middle' }, { x: 274, y: 116, anchor: 'start' },
  { x: 274, y: 228, anchor: 'start' }, { x: 180, y: 294, anchor: 'middle' },
  { x: 86, y: 228, anchor: 'end' }, { x: 86, y: 116, anchor: 'end' },
] as const;
const full = { R: 100, I: 100, A: 100, S: 100, E: 100, C: 100 };
export function RiasecRadar({ percentages }: { percentages: AssessmentPercentages }) {
  const titleId = useId(), descriptionId = useId();
  return <figure className="result-radar">
    <svg viewBox="0 0 360 340" role="img" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <title id={titleId}>Biểu đồ tỷ lệ Có theo 6 nhóm RIASEC</title>
      <desc id={descriptionId}>{riasecCodes.map(code => `${code}: ${percentages[code] === null ? 'không có câu hỏi' : `${Math.round(percentages[code]!)}%`}`).join('; ')}. Tỷ lệ dựa trên câu hỏi của chính lần làm, không phải phần trăm phù hợp nghề.</desc>
      {[1, 2 / 3, 1 / 3].map(scale => <polygon key={scale} points={radarPoints(full, 92 * scale)} fill="none" stroke="var(--border-strong)" strokeWidth="1" />)}
      {riasecCodes.map((code, index) => { const point = radarPoint(100, index); return <line key={code} x1="180" y1="170" x2={point.x} y2={point.y} stroke="var(--border-strong)" strokeDasharray="2,2" />; })}
      <polygon data-radar-values="" points={radarPoints(percentages)} fill="rgb(13 148 136 / 16%)" stroke="var(--primary)" strokeWidth="2.5" />
      {riasecCodes.map((code, index) => {
        const point = radarPoint(percentages[code], index), label = labels[index]!;
        return <g key={code} style={{ color: `var(--riasec-${code.toLowerCase()})` }}><circle cx={point.x} cy={point.y} r="3.5" fill={percentages[code] === null ? 'white' : 'currentColor'} stroke="currentColor" />
          <text x={label.x} y={label.y} textAnchor={label.anchor} fill="currentColor" fontSize="16" fontWeight="700">{code} · {percentages[code] === null ? '—' : `${Math.round(percentages[code]!)}%`}</text>
        </g>;
      })}
    </svg>
    <figcaption>Tỷ lệ lựa chọn Có trong từng nhóm. Dấu —: nhóm không có câu hỏi.</figcaption>
  </figure>;
}
