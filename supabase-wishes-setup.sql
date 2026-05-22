create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 80),
  message text not null check (char_length(trim(message)) between 1 and 500),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.wishes
add column if not exists is_approved boolean not null default false;

alter table public.wishes enable row level security;

drop policy if exists "Public can read wishes" on public.wishes;
create policy "Public can read wishes"
on public.wishes
for select
to anon
using (is_approved is true);

drop policy if exists "Public can insert wishes" on public.wishes;
create policy "Public can insert wishes"
on public.wishes
for insert
to anon
with check (is_approved is false);

revoke update, delete on public.wishes from anon;
grant select, insert on public.wishes to anon;
