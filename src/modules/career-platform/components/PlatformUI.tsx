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
      . AIHN chuyển thang kỹ năng 0–7 sang 0–5 và chọn tối đa 8 kỹ năng quan
      trọng. Các phép biến đổi chưa được USDOL/ETA thẩm định; chưa có lương hay
      tuyển sinh Việt Nam.
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
  if (pending) return <p role="status">Đang tải dữ liệu nghề…</p>;
  if (error)
    return (
      <div role="alert">
        <p>Không tải được dữ liệu nghề. Hãy kiểm tra kết nối và thử lại.</p>
        <Button variant="secondary" onClick={retry}>
          Thử tải lại dữ liệu nghề
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
      Chưa xác nhận lưu: {error.message} Dữ liệu nhập vẫn được giữ. Đọc lại
      trạng thái máy chủ trước khi thử lại.
    </p>
  ) : success ? (
    <p role="status">Đã lưu trên máy chủ.</p>
  ) : null;
}
