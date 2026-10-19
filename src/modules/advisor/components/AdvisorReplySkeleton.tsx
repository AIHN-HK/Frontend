import { ConfigProvider, Skeleton } from 'antd';
import type { ThemeConfig } from 'antd';

const skeletonTheme: ThemeConfig = {
  components: {
    Skeleton: {
      gradientFromColor: 'var(--border-default)',
      gradientToColor: 'var(--bg-surface-active)',
      paragraphLiHeight: 12,
      paragraphMarginTop: 0,
      blockRadius: 8,
    },
  },
};

export function AdvisorReplySkeleton() {
  return <div className="advisor-message assistant advisor-ai-waiting" role="status" aria-label="Đang chờ phản hồi từ AI">
    <span className="advisor-caption">Đang chờ AI trả lời…</span>
    <div aria-hidden="true"><ConfigProvider theme={skeletonTheme}>
      <Skeleton active title={false} paragraph={{ rows: 3, width: ['100%', '86%', '60%'] }} round />
    </ConfigProvider></div>
  </div>;
}
