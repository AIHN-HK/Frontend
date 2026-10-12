import { paths } from '@/routes/paths';
import type { SessionUser } from '@/shared/session/session.types';

export function postLoginPath(user: SessionUser, returnTo: string | null): string {
  const fallback = user.role === 'ADMIN' ? paths.admin : paths.dashboard;
  if (!returnTo || returnTo.length > 2048 || !returnTo.startsWith('/') || returnTo.startsWith('//') || returnTo.includes('\\') || Array.from(returnTo).some(char => char.charCodeAt(0) <= 32)) return fallback;
  const url = new URL(returnTo, 'https://aihn.invalid');
  const student = /^\/(dashboard|career-profile|assessment(?:\/results\/[^/]+)?|history|advisor|careers(?:\/[^/]+)?|recommendations(?:\/[^/]+)?|roadmap|settings)\/?$/;
  const admin = /^\/admin(?:\/(questions|scoring|holland-content|careers|students(?:\/[^/]+)?))?\/?$/;
  if (url.origin !== 'https://aihn.invalid' || !(student.test(url.pathname) || (user.role === 'ADMIN' && admin.test(url.pathname)))) return fallback;
  return url.pathname + url.search + url.hash;
}
