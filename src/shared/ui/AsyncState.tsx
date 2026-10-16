import type { ReactNode } from 'react';

type State = 'loading' | 'empty' | 'error' | 'unavailable' | 'success';
const labels: Record<Exclude<State, 'success'>, string> = {
  loading: 'Đang tải…', empty: 'Chưa có dữ liệu', error: 'Không thể tải trang', unavailable: 'Trang đang được chuẩn bị',
};

export function AsyncState({ state, title, description, action, children }: {
  state: State; title?: string; description?: string; action?: ReactNode; children?: ReactNode;
}) {
  if (state === 'success') return children;
  return <section className={`async-state async-state-${state}`} aria-busy={state === 'loading'} aria-live="polite">
    {state === 'loading' && <span className="spinner" aria-hidden="true" />}
    <h1>{title ?? labels[state]}</h1>
    {description && <p>{description}</p>}
    {action && <div className="state-actions">{action}</div>}
  </section>;
}
