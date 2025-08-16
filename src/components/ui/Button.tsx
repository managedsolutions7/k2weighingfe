import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const byVariant: Record<ButtonVariant, string> = {
  primary: 'bg-[rgb(var(--color-primary))] text-white hover:brightness-95',
  outline: 'border border-slate-200 bg-white hover:bg-slate-50',
  ghost: 'hover:bg-slate-100',
  danger: 'bg-[rgb(var(--color-danger))] text-white hover:brightness-95',
  success: 'bg-[rgb(var(--color-success))] text-white hover:brightness-95',
};

const bySize: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) => {
  const classes = twMerge(base, byVariant[variant], bySize[size], className);
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && (
        <span className="inline-block h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
