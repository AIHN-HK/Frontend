import { LottieIllustration } from '@/shared/ui/lottie/LottieIllustration';

export function AdvisorReplySkeleton() {
  return <div className="advisor-message assistant advisor-ai-waiting" role="status" aria-label="Đang chờ phản hồi từ AI">
    <LottieIllustration kind="advisor" size={64} />
    <span className="advisor-caption">Đang chờ AI trả lời…</span>
    <div className="advisor-wait-lines" aria-hidden="true">{[1,2,3].map(line => <span key={line} data-advisor-wait-line="" />)}</div>
  </div>;
}
