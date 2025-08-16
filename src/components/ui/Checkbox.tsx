import type { InputHTMLAttributes } from 'react';

export const Checkbox = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input type="checkbox" className={className} {...rest} />
);

export default Checkbox;
