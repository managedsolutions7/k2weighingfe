import type { PropsWithChildren } from 'react';
import Label from './Label';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}

export const FormField = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: PropsWithChildren<FormFieldProps>) => {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-red-600 ml-0.5">*</span> : null}
      </Label>
      {children}
      {hint && !error ? (
        <div className="text-xs text-gray-500" id={hintId}>
          {hint}
        </div>
      ) : null}
      {error ? (
        <div className="text-xs text-red-600" id={errorId}>
          {error}
        </div>
      ) : null}
    </div>
  );
};

export default FormField;
