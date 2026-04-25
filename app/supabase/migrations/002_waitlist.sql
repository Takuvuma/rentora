-- Waitlist email signups from the landing page
create table if not exists waitlist_emails (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table waitlist_emails enable row level security;

-- Only service role can read; anyone can insert (for the landing page form)
create policy "waitlist_insert_public" on waitlist_emails
  for insert with check (true);
