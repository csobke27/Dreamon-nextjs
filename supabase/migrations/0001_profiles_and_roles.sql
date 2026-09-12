-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run

create type public.app_role as enum ('admin', 'dev', 'user');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- "Automatically expose new tables" staat bewust uit op dit project, dus
-- zonder deze GRANT geeft Postgres altijd "permission denied", ongeacht
-- de RLS-policy hieronder.
grant select on public.profiles to authenticated;

-- Iedereen mag alleen zijn eigen profiel (en dus rol) lezen.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Niemand mag zelf zijn rol aanpassen (geen update-policy).
-- Rollen wijzig je zelf via Supabase Table Editor, tot er een admin-paneel is.

-- Maakt automatisch een profiel (met rol 'user') aan zodra iemand registreert.
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
