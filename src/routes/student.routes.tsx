import type { RouteObject } from 'react-router';
import { RequireSession } from './guards/RequireSession';
import { UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const studentRoutes: RouteObject[] = [{
  Component: RequireSession,
  children: [{
    lazy: async () => ({ Component: (await import('@/layouts/StudentLayout')).StudentLayout }),
    children: [paths.dashboard, paths.careerProfile, paths.assessment, '/assessment/results/:attemptId', paths.history, paths.advisor,
      paths.recommendations, '/recommendations/:recommendationId', paths.roadmap, paths.settings].map(path => ({ path, Component: UnavailableRoute })),
  }],
}];
