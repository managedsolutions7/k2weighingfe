export type PresetRange = '24h' | '7d' | '30d' | 'custom';

export const toIso = (d: Date) => d.toISOString();

export const startOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const endOfDay = (d: Date) => {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

export const getPresetRange = (preset: PresetRange): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  if (preset === '24h') {
    from.setTime(to.getTime() - 24 * 60 * 60 * 1000);
  } else if (preset === '7d') {
    from.setTime(to.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (preset === '30d') {
    from.setTime(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    from.setTime(to.getTime() - 24 * 60 * 60 * 1000);
  }
  return { from: toIso(from), to: toIso(to) };
};

export const formatDate = (iso: string | undefined | null, locale: string = 'en-GB') => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: '2-digit' });
};

export const formatDateTime = (iso: string | undefined | null, locale: string = 'en-GB') => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
