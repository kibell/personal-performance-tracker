# Performance Review Tracker

A persistent, year-based work journal that turns into an annual review. Public visitors get a read-only view; the signed-in owner can create, edit, duplicate, archive, delete and upload.

**Stack:** Next.js 15 (App Router, Server Actions) · TypeScript · Tailwind · Supabase (Postgres, Auth, Storage, Row Level Security)

## Setup (about 10 minutes)

1. **Create a Supabase project** (free tier is fine).
2. **Run the schema:** SQL Editor → paste `supabase/migrations/0001_init.sql` → Run. This creates all tables, RLS policies, the public `attachments` storage bucket (admin-only writes) and default categories/statuses.
3. **Optional demo data:** run `supabase/seed.sql`. Everything it adds is flagged as sample and can be removed in **Settings → Data**.
4. **Create your owner account:** Authentication → Users → *Add user* (email + password, auto-confirm). The **first** user created becomes the admin automatically. Then **Authentication → Sign In / Providers → turn off “Allow new users to sign up”** so nobody else can register.
5. **Configure env:** `cp .env.example .env.local` and fill in the project URL and anon/publishable key (Project Settings → API). **Never add the service_role key** — the app doesn't need it.
6. `npm install && npm run dev` → open http://localhost:3000, then `/login`.

### Deploy
Push to GitHub and import into Vercel (or any Node host). Set the same two `NEXT_PUBLIC_*` env vars. Share the site URL with your manager — they see the read-only version with no login.

## How access works
- **Read:** RLS policies allow `anon` to `SELECT` content. Archived rows are visible to the admin only.
- **Write:** every table's write policy requires `public.is_admin()` (a `profiles.is_admin` flag, set only for the first user). Storage uploads/deletes use the same check. Server Actions also verify admin before writing, but the database is the real gate.
- Anyone can load the *public* attachments bucket URLs, so don't upload anything you wouldn't show your manager.

## Using it
- **Quick add** (button or press **Q**): one sentence + save. Entries go to your *work inbox*; open them later to add detail (saving clears the flag). Drafts autosave locally.
- **Years:** switch in the top bar; **Add Year** starts blank. Rename/archive/delete in Settings → Years.
- **Work:** search/filter/sort/paginate, timeline view, screenshots (click, drag, or paste), captions, reorder, lightbox.
- **Goals:** SMART+A, status + % updated independently, linked work shown on each goal and goals shown on each entry.
- **Review Summary:** computed live from highlights, goals, learning, technologies and responsibilities; only the narrative, challenges and next-year priorities are hand-written.
- **Export:** *Print / PDF* (use “Save as PDF” in the print dialog), *Work as CSV*, *Review as Markdown*.
- **Settings:** categories and status options (add / rename / reorder / archive / delete-if-unused), years, profile, preferences, remove sample data.

## Project layout
```
app/                 routes (/[year], /[year]/work, goals, learning, role, review, print, export, /settings, /login)
components/          ui/ (modals, toasts, inputs) · layout/ · work/ goals/ learning/ review/ settings/ common/
lib/db/              read queries   lib/actions/   server-side mutations   lib/auth/  session
lib/export/          CSV + Markdown   lib/supabase/  clients   types/  entity types
supabase/            migrations + seed
```

## Known limitations / next steps
- One category per accomplishment (a join table is easy to add if you want several).
- Reordering uses up/down buttons rather than drag-and-drop.
- PDF is produced through the browser's print dialog (no server-side PDF engine).
- Database types are hand-written; run `supabase gen types` if you want generated ones.
