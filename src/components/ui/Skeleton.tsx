import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('animate-pulse bg-slate-200 rounded', className)} {...rest} />
);

export default Skeleton;
