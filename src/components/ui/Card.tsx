import type { HTMLAttributes, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ className, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => (
  <div className={twMerge('card p-4', className)} {...rest} />
);

export default Card;
