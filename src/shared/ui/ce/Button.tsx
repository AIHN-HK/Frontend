import { Button as AntButton } from 'antd';
import type { ButtonProps } from 'antd';

type Props = Omit<ButtonProps, 'type'|'htmlType'|'variant'> & {
  type?: ButtonProps['htmlType'];
  variant?: 'primary'|'secondary'|'ghost';
};

export function Button({ type = 'button', variant = 'primary', ...props }: Props) {
  return <AntButton {...props} htmlType={type} type={variant === 'primary' ? 'primary' : variant === 'ghost' ? 'text' : 'default'} />;
}
