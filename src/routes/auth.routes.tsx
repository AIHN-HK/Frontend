import type { RouteObject } from 'react-router';
import { GuestOnly } from './guards/GuestOnly';
import { UnavailableRoute } from './RouteStates';
import { paths } from './paths';

export const authRoutes: RouteObject[] = [{
  Component: GuestOnly,
  children: [{
    lazy: async () => ({ Component: (await import('@/layouts/AuthLayout')).AuthLayout }),
    children: [
      { path: paths.login, lazy: async () => ({ Component: (await import('@/modules/auth/login/pages/LoginPage')).LoginPage }) },
      ...[paths.signup, paths.verifyOtp, paths.forgotPassword, paths.resetPassword].map(path => ({ path, Component: UnavailableRoute })),
    ],
  }],
}];
