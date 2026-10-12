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
      { path: paths.signup, lazy: async () => ({ Component: (await import('@/modules/auth/registration/pages/SignupPage')).SignupPage }) },
      { path: paths.verifyOtp, lazy: async () => ({ Component: (await import('@/modules/auth/registration/pages/RegistrationHandoff')).RegistrationHandoff }) },
      ...[paths.forgotPassword, paths.resetPassword].map(path => ({ path, Component: UnavailableRoute })),
    ],
  }],
}];
