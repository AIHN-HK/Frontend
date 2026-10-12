import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './app/App';
import { createAppRuntime } from './app/bootstrap';
import { session } from './shared/session/session';
import { AsyncState } from './shared/ui/AsyncState';
import { browserAuthPersistence } from './modules/auth';
import './shared/styles/tokens.css';
import './shared/styles/global.css';
import './shared/styles/components.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing application root');
const root = createRoot(rootElement);
try {
  const runtime = createAppRuntime(session, browserAuthPersistence());
  void runtime.auth.hydrate();
  if (import.meta.hot) import.meta.hot.dispose(runtime.dispose);
  root.render(<StrictMode><App queryClient={runtime.queryClient} http={runtime.http} auth={runtime.auth} /></StrictMode>);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Application could not start');
  root.render(<main className="route-fallback"><AsyncState state="error" title="Ứng dụng chưa sẵn sàng" description="Vui lòng thử lại sau." /></main>);
}
