import type { YearData } from '@/types';
import { monthKey } from '@/lib/utils';

export function yearStats(d: YearData) {
  const goalsCompleted = d.goals.filter((g) => g.status?.phase === 'complete').length;
  const goalsActive = d.goals.filter((g) => g.status?.phase === 'active').length;
  const byCategory = new Map<string, number>();
  const byMonth: Record<string, number> = {};
  const tech = new Map<string, { name: string; count: number }>();
  for (const a of d.accomplishments) {
    const c = a.category?.name ?? 'Uncategorized';
    byCategory.set(c, (byCategory.get(c) ?? 0) + 1);
    byMonth[monthKey(a.work_date)] = (byMonth[monthKey(a.work_date)] ?? 0) + 1;
    for (const t of a.technologies) { const k = t.toLowerCase(); const e = tech.get(k) ?? { name: t, count: 0 }; e.count++; tech.set(k, e); }
  }
  return {
    accomplishments: d.accomplishments.length,
    highlights: d.accomplishments.filter((a) => a.is_highlight),
    inbox: d.accomplishments.filter((a) => a.needs_details),
    goals: d.goals.length, goalsCompleted, goalsActive,
    learning: d.learning.length, learningActive: d.learning.filter((l) => l.status?.phase === 'active').length,
    categories: [...byCategory].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    byMonth,
    tech: [...tech.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}
