import type { SelectHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  describedById?: string;
  invalid?: boolean;
}

export const Select = ({ className, describedById, invalid, ...rest }: SelectProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <select
    className={twMerge('border rounded px-3 py-2 w-full', className)}
    aria-describedby={describedById}
    aria-invalid={invalid ? true : undefined}
    {...rest}
  />
);

export default Select;
