import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string;
}

export const StatCard = ({ label, value, className, ...rest }: StatCardProps) => (
  <div className={twMerge('card p-4', className)} {...rest}>
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-2xl font-semibold">{value}</div>
  </div>
);

export default StatCard;
