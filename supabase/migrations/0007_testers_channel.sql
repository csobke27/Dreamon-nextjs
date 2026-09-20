-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Requires 0006 to have been run first.
-- Adds a testers channel visible to testers, developers, and admins.
-- Testers cannot start DMs themselves; that remains restricted to developers
-- and admins through the existing "Create DM channels" and "Add members to own
-- DM channels" policies. Testers can participate and share files after a
-- developer or admin opens a conversation with them.

create or replace function public.is_tester_dev_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'dev', 'tester')
  );
$$;

insert into public.channels (type, slug) values ('testers', 'testers-chat');

drop policy "Devs and admins can view the dev/admin roster" on public.profiles;
create policy "Devs and admins can view the dev/admin/tester roster"
  on public.profiles for select
  using (public.is_dev_or_admin() and role in ('admin', 'dev', 'tester'));

drop policy "View accessible channels" on public.channels;
create policy "View accessible channels"
  on public.channels for select
  using (
    (type = 'team' and public.is_dev_or_admin())
    or (type = 'admin' and public.is_admin())
    or (type = 'testers' and public.is_tester_dev_or_admin())
    or (type = 'dm' and exists (
      select 1 from public.channel_members
      where channel_id = channels.id and user_id = auth.uid()
    ))
  );

drop policy "View messages in accessible channels" on public.messages;
create policy "View messages in accessible channels"
  on public.messages for select
  using (
    exists (
      select 1 from public.channels c
      where c.id = messages.channel_id
      and (
        (c.type = 'team' and public.is_dev_or_admin())
        or (c.type = 'admin' and public.is_admin())
        or (c.type = 'testers' and public.is_tester_dev_or_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

drop policy "Send messages in accessible channels" on public.messages;
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
        or (c.type = 'testers' and public.is_tester_dev_or_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

drop policy "View attachments on visible messages" on public.attachments;
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
        or (c.type = 'testers' and public.is_tester_dev_or_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

drop policy "Chat files: read if channel accessible" on storage.objects;
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
        or (c.type = 'testers' and public.is_tester_dev_or_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );

drop policy "Chat files: upload if channel accessible" on storage.objects;
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
        or (c.type = 'testers' and public.is_tester_dev_or_admin())
        or (c.type = 'dm' and exists (
          select 1 from public.channel_members m
          where m.channel_id = c.id and m.user_id = auth.uid()
        ))
      )
    )
  );
