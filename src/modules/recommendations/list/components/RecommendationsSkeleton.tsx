import { ConfigProvider, Skeleton } from 'antd';
import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = { components: { Skeleton: { gradientFromColor: 'var(--border-default)', gradientToColor: 'var(--bg-surface-active)', blockRadius: 8, paragraphLiHeight: 12 } } };

export function RecommendationsSkeleton({ generating = false }: { generating?: boolean }) {
  const label = generating ? 'Đang tạo gợi ý · Minh họa' : 'Đang tải gợi ý mẫu';
  return <div className="recommendations-skeleton" role="status" aria-label={label}>
    <p>{label}{generating ? ' — không có yêu cầu AI thật.' : '…'}</p>
    <div aria-hidden="true"><ConfigProvider theme={theme}>{[1, 2, 3].map(i => <div className="recommendations-card" key={i}><Skeleton active round title={{ width: '65%' }} paragraph={{ rows: 3, width: ['100%', '88%', '68%'] }} /></div>)}</ConfigProvider></div>
  </div>;
}
