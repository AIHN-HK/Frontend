import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export function Field({ label, hint, error, id, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const description = error ?? hint;
  return <div className={`field ${className}`}>
    <label htmlFor={fieldId}>{label}</label>
    <input id={fieldId} aria-invalid={Boolean(error)} aria-describedby={description ? `${fieldId}-description` : undefined} {...props} />
    {description && <span id={`${fieldId}-description`} className={error ? 'field-error' : 'field-hint'}>{description}</span>}
  </div>;
}
