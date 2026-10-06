-- Performance Review Tracker — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Model: everyone can READ published content; only admin users can WRITE.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- users (profiles) — one row per auth user. The FIRST user created becomes the admin.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  job_title    text,
  department   text,
  bio          text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
-- At most one admin row can exist per auth user; keep an index for the policy lookup.
create index profiles_admin_idx on public.profiles (id) where is_admin;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    not exists (select 1 from public.profiles where is_admin)
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- years
-- ---------------------------------------------------------------------------
create table public.years (
  id          uuid primary key default gen_random_uuid(),
  year        integer not null unique check (year between 1990 and 2200),
  label       text not null,
  is_sample   boolean not null default false,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- lookups: categories, statuses (editable by admin)
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sort_order  integer not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index categories_name_uq on public.categories (lower(name));

create type public.status_kind  as enum ('work', 'goal', 'learning');
create type public.status_phase as enum ('not_started', 'active', 'complete', 'inactive');
create type public.status_tone  as enum ('neutral', 'info', 'success', 'warning', 'danger');

create table public.statuses (
  id          uuid primary key default gen_random_uuid(),
  kind        public.status_kind not null,
  name        text not null,
  phase       public.status_phase not null default 'active',
  tone        public.status_tone not null default 'neutral',
  sort_order  integer not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index statuses_kind_name_uq on public.statuses (kind, lower(name));

-- ---------------------------------------------------------------------------
-- role & responsibilities (per year)
-- ---------------------------------------------------------------------------
create table public.year_roles (
  year_id      uuid primary key references public.years (id) on delete cascade,
  job_title    text,
  team         text,
  summary      text,
  focus_areas  text,
  updated_at   timestamptz not null default now()
);

create table public.responsibilities (
  id          uuid primary key default gen_random_uuid(),
  year_id     uuid not null references public.years (id) on delete cascade,
  title       text not null,
  description text,
  sort_order  integer not null default 0,
  is_sample   boolean not null default false,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index responsibilities_year_idx on public.responsibilities (year_id, sort_order);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table public.goals (
  id             uuid primary key default gen_random_uuid(),
  year_id        uuid not null references public.years (id) on delete cascade,
  title          text not null,
  description    text,
  sustainable    text,
  measurable     text,
  attainable     text,
  relevant       text,
  time_based     text,
  aligned        text,
  success_metric text,
  target_date    date,
  status_id      uuid references public.statuses (id) on delete restrict,
  progress       integer not null default 0 check (progress between 0 and 100),
  progress_notes text,
  final_outcome  text,
  is_sample      boolean not null default false,
  archived_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index goals_year_idx   on public.goals (year_id, archived_at);
create index goals_status_idx on public.goals (status_id);

-- ---------------------------------------------------------------------------
-- accomplishments
-- ---------------------------------------------------------------------------
create table public.accomplishments (
  id            uuid primary key default gen_random_uuid(),
  year_id       uuid not null references public.years (id) on delete cascade,
  title         text not null,
  work_date     date not null default current_date,
  description   text,
  category_id   uuid references public.categories (id) on delete restrict,
  project       text,
  contribution  text,
  impact        text,
  technologies  text[] not null default '{}',
  evidence_url  text,
  notes         text,
  status_id     uuid references public.statuses (id) on delete restrict,
  is_highlight  boolean not null default false,
  needs_details boolean not null default false,   -- "work inbox" flag set by Quick Add
  search_blob   text not null default '',
  is_sample     boolean not null default false,
  archived_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index accomplishments_year_date_idx on public.accomplishments (year_id, work_date desc);
create index accomplishments_category_idx  on public.accomplishments (category_id);
create index accomplishments_status_idx    on public.accomplishments (status_id);
create index accomplishments_highlight_idx on public.accomplishments (year_id) where is_highlight;
create index accomplishments_tech_idx      on public.accomplishments using gin (technologies);

create or replace function public.accomplishments_search_blob() returns trigger
language plpgsql as $$
begin
  new.search_blob := lower(concat_ws(' ', new.title, new.description, new.contribution,
    new.impact, new.notes, new.project, array_to_string(new.technologies, ' ')));
  return new;
end $$;
create trigger accomplishments_blob before insert or update on public.accomplishments
  for each row execute function public.accomplishments_search_blob();

create table public.accomplishment_goals (
  accomplishment_id uuid not null references public.accomplishments (id) on delete cascade,
  goal_id           uuid not null references public.goals (id) on delete cascade,
  primary key (accomplishment_id, goal_id)
);
create index accomplishment_goals_goal_idx on public.accomplishment_goals (goal_id);

create table public.accomplishment_responsibilities (
  accomplishment_id uuid not null references public.accomplishments (id) on delete cascade,
  responsibility_id uuid not null references public.responsibilities (id) on delete cascade,
  primary key (accomplishment_id, responsibility_id)
);
create index accomplishment_resp_resp_idx on public.accomplishment_responsibilities (responsibility_id);

-- ---------------------------------------------------------------------------
-- learning & development
-- ---------------------------------------------------------------------------
create table public.learning_items (
  id              uuid primary key default gen_random_uuid(),
  year_id         uuid not null references public.years (id) on delete cascade,
  title           text not null,
  item_type       text not null default 'Skill',
  description     text,
  start_date      date,
  completion_date date,
  status_id       uuid references public.statuses (id) on delete restrict,
  notes           text,
  goal_id         uuid references public.goals (id) on delete set null,
  resource_url    text,
  is_sample       boolean not null default false,
  archived_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index learning_year_idx on public.learning_items (year_id, archived_at);
create index learning_goal_idx on public.learning_items (goal_id);

create table public.learning_accomplishments (
  learning_id       uuid not null references public.learning_items (id) on delete cascade,
  accomplishment_id uuid not null references public.accomplishments (id) on delete cascade,
  primary key (learning_id, accomplishment_id)
);
create index learning_acc_acc_idx on public.learning_accomplishments (accomplishment_id);

-- ---------------------------------------------------------------------------
-- attachments (files live in Storage bucket "attachments")
-- ---------------------------------------------------------------------------
create table public.attachments (
  id                uuid primary key default gen_random_uuid(),
  accomplishment_id uuid references public.accomplishments (id) on delete cascade,
  learning_id       uuid references public.learning_items (id) on delete cascade,
  storage_path      text not null unique,
  file_name         text not null,
  mime_type         text,
  size_bytes        bigint,
  caption           text,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  constraint attachments_one_owner check (num_nonnulls(accomplishment_id, learning_id) = 1)
);
create index attachments_acc_idx on public.attachments (accomplishment_id, sort_order);
create index attachments_learn_idx on public.attachments (learning_id, sort_order);

-- ---------------------------------------------------------------------------
-- review summary (manual narrative parts; everything else is computed live)
-- ---------------------------------------------------------------------------
create table public.review_summaries (
  year_id          uuid primary key references public.years (id) on delete cascade,
  narrative        text,
  challenges       text,
  next_priorities  text,
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- settings (key/value)
-- ---------------------------------------------------------------------------
create table public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','years','year_roles','responsibilities','goals','accomplishments',
                           'learning_items','review_summaries','settings']
  loop
    execute format('create trigger %I_updated before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon + authenticated): read. Admin only: write. Archived rows: admin only.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','years','categories','statuses','year_roles','responsibilities','goals',
    'accomplishments','accomplishment_goals','accomplishment_responsibilities','learning_items',
    'learning_accomplishments','attachments','review_summaries','settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- plain public read
do $$
declare t text;
begin
  foreach t in array array['categories','statuses','year_roles','accomplishment_goals',
    'accomplishment_responsibilities','learning_accomplishments','attachments','review_summaries','settings']
  loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- public read, but archived rows are visible to the admin only
do $$
declare t text;
begin
  foreach t in array array['years','responsibilities','goals','accomplishments','learning_items']
  loop
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (archived_at is null or public.is_admin())', t);
  end loop;
end $$;

-- profiles: public may read names/titles (no emails live here); users may not self-promote
create policy "public read" on public.profiles for select to anon, authenticated using (true);

-- Explicit grants (newer Supabase projects no longer expose new tables automatically).
-- RLS above is what actually restricts access; anon gets SELECT only.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket, admin-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('attachments', 'attachments', true, 10485760)
on conflict (id) do nothing;

create policy "attachments admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments' and public.is_admin());
create policy "attachments admin update" on storage.objects for update to authenticated
  using (bucket_id = 'attachments' and public.is_admin());
create policy "attachments admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'attachments' and public.is_admin());
create policy "attachments admin select" on storage.objects for select to authenticated
  using (bucket_id = 'attachments' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Default lookups
-- ---------------------------------------------------------------------------
insert into public.categories (name, sort_order)
select n, (row_number() over ())::int * 10
from unnest(array[
  'Salesforce Marketing Cloud','CloudPages','Front-End Development','Accessibility',
  'Performance / Core Web Vitals','Campaign Support','Landing Pages','Email / SMS Support',
  'Process Improvement','Reusable Components','Technical Debt','Development Workflow',
  'Collaboration','Learning / Professional Development','Data Extensions / Dynamic Content','Other'
]) as n;

insert into public.statuses (kind, name, phase, tone, sort_order) values
  ('work','Planned','not_started','neutral',10),
  ('work','In Progress','active','info',20),
  ('work','Completed','complete','success',30),
  ('work','On Hold','inactive','warning',40),
  ('work','Cancelled','inactive','danger',50),
  ('goal','Not Started','not_started','neutral',10),
  ('goal','In Progress','active','info',20),
  ('goal','On Track','active','success',30),
  ('goal','At Risk','active','warning',40),
  ('goal','Completed','complete','success',50),
  ('goal','Deferred','inactive','neutral',60),
  ('learning','Planned','not_started','neutral',10),
  ('learning','In Progress','active','info',20),
  ('learning','Completed','complete','success',30),
  ('learning','Paused','inactive','warning',40);

insert into public.settings (key, value) values
  ('preferences', '{"pageSize": 20, "defaultTheme": "system"}'::jsonb);
