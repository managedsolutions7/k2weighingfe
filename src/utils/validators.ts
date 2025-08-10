export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const required = (v: unknown, msg = 'This field is required') =>
  v === undefined || v === null || v === '' ? msg : '';

export const minLen = (v: string, n: number, msg?: string) =>
  (v?.length ?? 0) < n ? (msg ?? `Must be at least ${n} characters`) : '';

export const isEmail = (v: string, msg = 'Invalid email') =>
  v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? msg : '';
