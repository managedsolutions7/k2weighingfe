export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const required = (v: unknown, msg = 'This field is required') =>
  v === undefined || v === null || v === '' ? msg : '';

export const minLen = (v: string, n: number, msg?: string) =>
  (v?.length ?? 0) < n ? (msg ?? `Must be at least ${n} characters`) : '';

export const isEmail = (v: string, msg = 'Invalid email') =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : '';

export const isGST = (v: string, msg = 'Invalid GST number') => {
  if (!v) return '';
  const value = v.toUpperCase();
  // Basic GSTIN format validation
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value) ? '' : msg;
};
