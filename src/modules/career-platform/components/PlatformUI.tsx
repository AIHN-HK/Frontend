import type { ReactNode } from "react";
import { CareerScreenFrame } from '@/shared/ui/ce/CareerScreenFrame';
import { usePageEntrance } from '@/shared/ui/ce/usePageEntrance';
import { Button } from "@/shared/ui/Button";
import "./platform.css";
export function PlatformFrame({
  title,
  children,
  className,
  sidebar,
  animationKey,
  showTitle = true,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  sidebar?: ReactNode;
  animationKey?: string | number;
  showTitle?: boolean;
}) {
  const root = usePageEntrance(className ? animationKey ?? title : undefined);
  const content = (
    <div ref={root} className={`career-platform ${className ?? ''}`}>
      {showTitle && <h1 data-ce-enter="">{title}</h1>}
      {children}
    </div>
  );
  return className ? <CareerScreenFrame sidebar={sidebar}>{content}</CareerScreenFrame> : content;
}
export function SourceNote() {
  return (
    <p className="platform-source" role="note">
      Dữ liệu tham khảo nghề tại Mỹ từ{" "}
      <a
        href="https://www.onetcenter.org/database.html"
        target="_blank"
        rel="noreferrer"
      >
        O*NET® 31.0 Database
      </a>{" "}
      · USDOL/ETA ·{" "}
      <a
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noreferrer"
      >
        CC BY 4.0
      </a>
      . Kỹ năng được đổi từ thang 0–7 sang 0–5, giữ tối đa 8 kỹ năng quan trọng. Cách đổi chưa được USDOL/ETA thẩm định. Chưa có dữ liệu lương hay tuyển sinh Việt Nam.
    </p>
  );
}
export function ReadState({
  pending,
  error,
  retry,
}: {
  pending: boolean;
  error: boolean;
  retry(): void;
}) {
  if (pending) return <p role="status">Đang tải thông tin nghề…</p>;
  if (error)
    return (
      <div role="alert">
        <p>Chưa tải được thông tin nghề. Kiểm tra mạng rồi thử lại.</p>
        <Button variant="secondary" onClick={retry}>
          Tải lại
        </Button>
      </div>
    );
  return null;
}
export function CommandState({
  error,
  success,
}: {
  error: Error | null;
  success: boolean;
}) {
  return error ? (
    <p role="alert">
      Chưa xác nhận lưu: {error.message} Nội dung vẫn được giữ. Kiểm tra bản đã lưu trước khi thử lại.
    </p>
  ) : success ? (
    <p role="status">Đã lưu.</p>
  ) : null;
}
