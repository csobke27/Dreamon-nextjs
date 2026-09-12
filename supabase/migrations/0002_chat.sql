-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Vereist dat 0001_profiles_and_roles.sql al is uitgevoerd.

-- Herbruikbare rol-checks voor de policies hieronder.
create or replace function public.is_dev_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'dev')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create type public.channel_type as enum ('team', 'admin', 'dm');

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  type public.channel_type not null,
  slug text unique,
  created_at timestamptz not null default now()
);

-- Team- en admin-kanaal zijn vaste, eenmalige kanalen. DM-kanalen ontstaan on-demand.
insert into public.channels (type, slug) values
  ('team', 'team-chat'),
  ('admin', 'admin-chat');

create table public.channel_members (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (channel_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_size bigint not null,
  content_type text,
  created_at timestamptz not null default now()
);

alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

-- Zelfde valkuil als bij profiles: zonder deze GRANTs "permission denied",
-- ongeacht de policies hieronder ("Automatically expose new tables" staat uit).
grant select, insert on public.channels to authenticated;
grant select, insert on public.channel_members to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.attachments to authenticated;

-- Devs/admins moeten elkaar kunnen vinden om een DM te starten.
create policy "Devs and admins can view the dev/admin roster"
  on public.profiles for select
  using (public.is_dev_or_admin() and role in ('admin', 'dev'));

-- Channels: team = alle devs/admins, admin = alleen admins, dm = alleen de deelnemers.
create policy "View accessible channels"
  on public.channels for select
  using (
    (type = 'team' and public.is_dev_or_admin())
    or (type = 'admin' and public.is_admin())
    or (type = 'dm' and exists (
      select 1 from public.channel_members
      where channel_id = channels.id and user_id = auth.uid()
    ))
  );

create policy "Create DM channels"
  on public.channels for insert
  with check (type = 'dm' and public.is_dev_or_admin());

-- Bypasst RLS bewust (security definer) om te bepalen in welke kanalen je zit,
-- zonder de recursieve zelf-join die anders nodig zou zijn in de policy hieronder.
create or replace function public.my_channel_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select channel_id from public.channel_members where user_id = auth.uid();
$$;

-- Je ziet je eigen lidmaatschappen, plus wie er verder in jouw kanalen zit
-- (nodig om te weten met wie je praat in een DM).
create policy "View memberships of your own channels"
  on public.channel_members for select
  using (
    user_id = auth.uid()
    or channel_id in (select public.my_channel_ids())
  );

-- Je mag jezelf toevoegen, of iemand anders toevoegen aan een DM waar je zelf al in zit
-- (zo kun je een gesprek starten: eerst jezelf, dan de ander).
create policy "Add members to own DM channels"
  on public.channel_members for insert
  with check (
    public.is_dev_or_admin()
    and exists (select 1 from public.channels where id = channel_id and type = 'dm')
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.channel_members existing
        where existing.channel_id = channel_members.channel_id
        and existing.user_id = auth.uid()
      )
    )
  );

create policy "View messages in accessible channels"
  on public.messages for select
  using (
    exists (
      select 1 from public.channels c
      where c.id = messages.channel_id
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

create policy "Send messages in accessible channels"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.channels c
      where c.id = channel_id
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

create policy "View attachments on visible messages"
  on public.attachments for select
  using (
    exists (
      select 1 from public.messages msg
      join public.channels c on c.id = msg.channel_id
      where msg.id = attachments.message_id
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

create policy "Add attachments to own messages"
  on public.attachments for insert
  with check (
    exists (select 1 from public.messages where id = message_id and sender_id = auth.uid())
  );

-- Live updates (nieuwe berichten verschijnen zonder te verversen).
alter publication supabase_realtime add table public.messages;

-- Admin-logboek: alleen welk bestand, door wie, in welk gesprek/kanaal.
-- Leest expres nooit messages.body, zodat berichtinhoud privé blijft.
create or replace function public.admin_file_log()
returns table (
  attachment_id uuid,
  file_name text,
  file_size bigint,
  storage_path text,
  shared_at timestamptz,
  sender_email text,
  channel_type public.channel_type,
  channel_label text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    a.id,
    a.file_name,
    a.file_size,
    a.storage_path,
    a.created_at,
    sender.email,
    c.type,
    case
      when c.type = 'dm' then (
        select string_agg(p.email, ' & ' order by p.email)
        from public.channel_members cm
        join public.profiles p on p.id = cm.user_id
        where cm.channel_id = c.id
      )
      else c.slug
    end
  from public.attachments a
  join public.messages msg on msg.id = a.message_id
  join public.channels c on c.id = msg.channel_id
  join public.profiles sender on sender.id = msg.sender_id
  where public.is_admin()
  order by a.created_at desc;
$$;

grant execute on function public.admin_file_log() to authenticated;

-- Opslag voor gedeelde bestanden. Pad-conventie: {channel_id}/{bestandsnaam}.
insert into storage.buckets (id, name, public)
values ('chat-files', 'chat-files', false)
on conflict (id) do nothing;

create policy "Chat files: read if channel accessible"
  on storage.objects for select
  using (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.channels c
      where c.id::text = (storage.foldername(name))[1]
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

create policy "Chat files: upload if channel accessible"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-files'
    and exists (
      select 1 from public.channels c
      where c.id::text = (storage.foldername(name))[1]
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );
