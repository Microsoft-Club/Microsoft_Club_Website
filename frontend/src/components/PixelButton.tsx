import type { ButtonHTMLAttributes } from 'react';

type PixelButtonVariant = 'primary' | 'secondary' | 'success' | 'warn' | 'info';

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: PixelButtonVariant;
};

const variantClass: Record<PixelButtonVariant, string> = {
  primary: 'btn--blue',
  secondary: 'btn--coral',
  success: 'btn--lime',
  warn: 'btn--yellow',
  info: 'btn--white',
};

const PixelButton = ({ label, variant = 'primary', className = '', type = 'button', ...rest }: PixelButtonProps) => (
  <button type={type} className={`btn ${variantClass[variant]} ${className}`} {...rest}>
    {label}
  </button>
);

export default PixelButton;
