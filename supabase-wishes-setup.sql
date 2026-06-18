create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(trim(name)) between 1 and 80),
  message text not null check (char_length(trim(message)) between 1 and 500),
  attendance_status text check (attendance_status is null or attendance_status in ('Hadir', 'Tidak Hadir')),
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.wishes
add column if not exists is_approved boolean not null default true;

alter table public.wishes
alter column is_approved set default true;

update public.wishes
set is_approved = true
where is_approved is false;

alter table public.wishes
add column if not exists attendance_status text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wishes_attendance_status_check'
  ) then
    alter table public.wishes
    add constraint wishes_attendance_status_check
    check (attendance_status is null or attendance_status in ('Hadir', 'Tidak Hadir'));
  end if;
end $$;

alter table public.wishes enable row level security;

drop policy if exists "Public can read wishes" on public.wishes;
create policy "Public can read wishes"
on public.wishes
for select
to anon
using (true);

drop policy if exists "Public can insert wishes" on public.wishes;
create policy "Public can insert wishes"
on public.wishes
for insert
to anon
with check (true);

revoke update, delete on public.wishes from anon;
grant select, insert on public.wishes to anon;
