import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { AsyncState } from '@/shared/ui/AsyncState';
export function AdminDataState<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (!query.data)
    return (
      <AsyncState
        state={query.isError ? 'error' : 'loading'}
        title={query.isError ? 'Chưa tải được dữ liệu quản trị' : 'Đang tải dữ liệu…'}
        action={
          query.isError ? (
            <button className="btn btn-secondary" onClick={() => void query.refetch()}>
              Thử tải lại
            </button>
          ) : undefined
        }
      />
    );
  return (
    <>
      {query.isError && <p role="alert">Chưa làm mới được. Bạn đang xem dữ liệu lần tải trước.</p>}
      {children(query.data)}
    </>
  );
}
