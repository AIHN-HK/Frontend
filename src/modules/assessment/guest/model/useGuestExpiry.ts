import { useEffect, useState } from 'react';

export function useGuestExpiry(expiresAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return expiresAt !== undefined && expiresAt <= now;
}
