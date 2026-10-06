import Link from 'next/link';
import { RotateCcw, Search } from 'lucide-react';
import { AutoSubmitForm } from '@/components/ui/AutoSubmitForm';
import type { Category, Goal, Status } from '@/types';

interface Props {
  year: number; values: Record<string, string>; categories: Category[]; statuses: Status[]; goals: Goal[];
  projects: string[]; techs: string[]; admin: boolean;
}

export function WorkFilters({ year, values: v, categories, statuses, goals, projects, techs, admin }: Props) {
  const sel = 'input py-1.5';
  return (
    <AutoSubmitForm className="card mb-4 space-y-3 p-4">
      <div className="flex flex-wrap gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search work</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted" aria-hidden />
          <input type="search" name="q" defaultValue={v.q} placeholder="Search title, description, contribution, notes, technology, category…" className="input pl-9" />
        </label>
        <label><span className="sr-only">Sort</span>
          <select name="sort" defaultValue={v.sort || 'date_desc'} className={sel}>
            <option value="date_desc">Newest first</option><option value="date_asc">Oldest first</option>
            <option value="title_asc">Title A–Z</option><option value="updated_desc">Recently updated</option>
          </select></label>
        <button className="btn btn-primary">Apply</button>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        <label><span className="label">Category</span><select name="category" defaultValue={v.category} className={sel}><option value="">All</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label><span className="label">Status</span><select name="status" defaultValue={v.status} className={sel}><option value="">All</option>{statuses.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label><span className="label">Goal</span><select name="goal" defaultValue={v.goal} className={sel}><option value="">All</option>{goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
        <label><span className="label">Project</span><select name="project" defaultValue={v.project} className={sel}><option value="">All</option>{projects.map((p) => <option key={p}>{p}</option>)}</select></label>
        <label><span className="label">Technology / skill</span><select name="tech" defaultValue={v.tech} className={sel}><option value="">All</option>{techs.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label><span className="label">View</span><select name="view" defaultValue={v.view || 'list'} className={sel}><option value="list">List</option><option value="timeline">Timeline</option></select></label>
        <label><span className="label">From</span><input type="date" name="from" defaultValue={v.from} className={sel} /></label>
        <label><span className="label">To</span><input type="date" name="to" defaultValue={v.to} className={sel} /></label>
        {admin && <label><span className="label">Show</span><select name="show" defaultValue={v.show || 'active'} className={sel}><option value="active">Active</option><option value="archived">Archive</option><option value="all">All</option></select></label>}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="highlight" value="1" defaultChecked={v.highlight === '1'} className="h-4 w-4 accent-[rgb(var(--accent))]" />Review highlights only</label>
        {admin && <label className="flex items-center gap-2"><input type="checkbox" name="inbox" value="1" defaultChecked={v.inbox === '1'} className="h-4 w-4 accent-[rgb(var(--accent))]" />Inbox (needs details)</label>}
        <Link href={`/${year}/work`} className="btn btn-ghost btn-sm ml-auto"><RotateCcw className="h-3.5 w-3.5" aria-hidden />Reset filters</Link>
      </div>
    </AutoSubmitForm>
  );
}
