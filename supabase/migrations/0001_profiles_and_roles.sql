-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run

create type public.app_role as enum ('admin', 'dev', 'user');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- "Automatically expose new tables" is intentionally disabled for this project,
-- so without this GRANT Postgres always returns "permission denied", regardless
-- of the RLS policy below.
grant select on public.profiles to authenticated;

-- Everyone may only read their own profile and role.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Nobody may change their own role (there is no update policy).
-- Change roles manually through the Supabase Table Editor until an admin panel exists.

-- Automatically creates a profile with the 'user' role when someone registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
