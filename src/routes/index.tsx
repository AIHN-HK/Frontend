import { createBrowserRouter } from 'react-router';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';
import { adminRoutes } from './admin.routes';
import { previewRoutes } from './preview.routes';
import { RootRoute, RouteError, RoutePending } from './RouteStates';

export const router = createBrowserRouter([{
  Component: RootRoute,
  ErrorBoundary: RouteError,
  HydrateFallback: RoutePending,
  children: [...publicRoutes, ...authRoutes, ...studentRoutes, ...adminRoutes, ...previewRoutes],
}]);
