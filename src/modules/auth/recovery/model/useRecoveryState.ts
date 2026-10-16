import { useEffect, useState } from 'react';
import { recoveryState } from '../../model/recovery-state';

export function useRecoveryState() {
  const [flow, setFlow] = useState(recoveryState.read);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => { setFlow(recoveryState.read()); setNow(Date.now()); };
    const unsubscribe = recoveryState.subscribe(update);
    const timer = window.setInterval(update, 1000);
    return () => { unsubscribe(); window.clearInterval(timer); };
  }, []);
  return { flow, now };
}
