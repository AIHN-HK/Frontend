import type { RouteObject } from 'react-router';
import { RequireSession } from './guards/RequireSession';
import { UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const studentRoutes: RouteObject[] = [{
  Component: RequireSession,
  children: [{
    lazy: async () => ({ Component: (await import('@/layouts/StudentLayout')).StudentLayout }),
    children: [
      { path: paths.dashboard, lazy: async () => ({ Component: (await import('@/modules/dashboard/pages/DashboardPage')).DashboardPage }) },
      { path: paths.careerProfile, lazy: async () => ({ Component: (await import('@/modules/profile/pages/CareerProfilePage')).CareerProfilePage }) },
      ...[paths.assessment, '/assessment/results/:attemptId', paths.history, paths.advisor,
        paths.recommendations, '/recommendations/:recommendationId', paths.roadmap, paths.settings].map(path => ({ path, Component: UnavailableRoute })),
    ],
  }],
}];
