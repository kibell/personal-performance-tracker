import clsx, { type ClassValue } from 'clsx';
export const cn = (...v: ClassValue[]) => clsx(v);

/** Parse a `YYYY-MM-DD` string without timezone shifting. */
export function formatDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!d) return '';
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', opts).format(new Date(y, m - 1, day));
}
export const formatTimestamp = (d: string) => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d));
export const monthKey = (d: string) => d.slice(0, 7);
export const monthLabel = (key: string) => formatDate(`${key}-01`, { month: 'long', year: 'numeric' });
export const localToday = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`; };

export function parseTags(raw: string | null | undefined): string[] {
  const seen = new Set<string>();
  return (raw ?? '').split(/[,\n]/).map((s) => s.trim()).filter((s) => {
    const k = s.toLowerCase();
    if (!s || seen.has(k)) return false;
    seen.add(k); return true;
  });
}
export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;
export const formatBytes = (n: number | null) => (n == null ? '' : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
export const safeUrl = (u: string | null | undefined) => (u && /^https?:\/\//i.test(u) ? u : null);
export function lines(text: string | null | undefined) { return (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean); }
