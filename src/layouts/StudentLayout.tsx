import { Outlet } from 'react-router';
import type { ReactNode } from 'react';
import { AppHeader } from './components/AppHeader';
import { CareerThemeBoundary } from './components/CareerThemeBoundary';

export function StudentLayout({ account }: { account?: ReactNode }) {
  return <CareerThemeBoundary>
    <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
    <AppHeader account={account} /><main id="main-content" tabIndex={-1}><Outlet /></main>
  </CareerThemeBoundary>;
}
