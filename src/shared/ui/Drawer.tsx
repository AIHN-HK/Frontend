import { Dialog } from './Dialog';
import type { DialogProps } from './Dialog';

export function Drawer({ className = '', ...props }: DialogProps) {
  return <Dialog {...props} className={`drawer ${className}`} />;
}
