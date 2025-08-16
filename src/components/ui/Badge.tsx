import type { HTMLAttributes, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'default' | 'success' | 'danger' | 'warning';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const byVariant: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-800',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-800',
  warning: 'bg-amber-100 text-amber-800',
};

export const Badge = ({
  variant = 'default',
  className,
  ...rest
}: PropsWithChildren<BadgeProps>) => (
  <span
    className={twMerge('px-2 py-0.5 text-xs rounded', byVariant[variant], className)}
    {...rest}
  />
);

export default Badge;
