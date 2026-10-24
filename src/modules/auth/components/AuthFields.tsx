import { useId } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

type Props<T extends FieldValues> = Omit<InputProps, 'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'ref'> & {
  name: FieldPath<T>;
  control: Control<T>;
};
export function AuthInput<T extends FieldValues>({control, name, ...props}: Props<T>) {
  return <Controller control={control} name={name} render={({field}) => <Input {...props} {...field} ref={field.ref} />} />;
}
export function AuthField<T extends FieldValues>({label, error, hint, id, ...props}: Props<T> & {label:string; error?:string; hint?:string}) {
  const generated = useId(), fieldId = id ?? generated, description = error ?? hint;
  return <div className="field"><label htmlFor={fieldId}>{label}</label>
    <AuthInput {...props} id={fieldId} aria-invalid={!!error} aria-describedby={description ? `${fieldId}-description` : undefined} />
    {description && <span id={`${fieldId}-description`} className={error ? 'field-error' : 'field-hint'}>{description}</span>}
  </div>;
}
