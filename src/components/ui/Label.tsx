import type { LabelHTMLAttributes, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

export const Label = ({
  className,
  ...rest
}: PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>) => (
  <label className={twMerge('text-sm font-medium text-gray-700', className)} {...rest} />
);

export default Label;
