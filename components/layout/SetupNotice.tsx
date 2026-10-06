export function SetupNotice({ error }: { error?: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card p-8">
        <h1 className="text-xl font-semibold">Connect your Supabase project</h1>
        <p className="mt-2 text-sm text-muted">{error ?? 'The app is running, but it cannot reach its database yet.'}</p>
        <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm">
          <li>Create a free project at supabase.com.</li>
          <li>In the SQL editor, run <code className="rounded bg-surface2 px-1">supabase/migrations/0001_init.sql</code> (optionally then <code className="rounded bg-surface2 px-1">supabase/seed.sql</code> for demo data).</li>
          <li>Copy <code className="rounded bg-surface2 px-1">.env.example</code> to <code className="rounded bg-surface2 px-1">.env.local</code> and fill in the project URL and anon key.</li>
          <li>Create your owner account under Authentication → Users, then turn off “Allow new users to sign up”.</li>
          <li>Restart the dev server and open <code className="rounded bg-surface2 px-1">/login</code>.</li>
        </ol>
        <p className="mt-5 text-xs text-muted">See README.md for the full walkthrough and deployment notes.</p>
      </div>
    </div>
  );
}
