import { Outlet, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { AppHeader } from './components/AppHeader';
import { CareerThemeBoundary } from './components/CareerThemeBoundary';
import { AmbientParticles } from '@/shared/ui/particles/AmbientParticles';

export function StudentLayout({ account, brandTo }: { account?: ReactNode; brandTo?: string }) {
  const { pathname } = useLocation();
  const preset = pathname.startsWith('/assessment') ? (pathname.includes('result') ? 'result' : 'assessment')
    : pathname.startsWith('/advisor') ? 'advisor'
    : /^\/(careers|recommendations|roadmap|career-profile)(\/|$)/.test(pathname) ? 'career' : null;
  return <CareerThemeBoundary>
    {preset && <AmbientParticles preset={preset} />}
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <AppHeader account={account} brandTo={brandTo} /><main id="main-content" tabIndex={-1}><Outlet /></main>
  </CareerThemeBoundary>;
}
