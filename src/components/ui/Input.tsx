import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  describedById?: string;
  invalid?: boolean;
}

export const Input = ({ className, describedById, invalid, ...rest }: InputProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <input
    className={twMerge('border rounded px-3 py-2 w-full', className)}
    aria-describedby={describedById}
    aria-invalid={invalid ? true : undefined}
    {...rest}
  />
);

export default Input;
