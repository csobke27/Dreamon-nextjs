-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Fixes the creation of a new DM conversation. The old policy checked whether
-- the channel existed through a regular query on "channels", but a brand-new DM
-- channel is not yet readable because the user is not a member. This function
-- intentionally bypasses that circular dependency.

create or replace function public.channel_is_dm(cid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.channels where id = cid and type = 'dm');
$$;

drop policy "Add members to own DM channels" on public.channel_members;

create policy "Add members to own DM channels"
  on public.channel_members for insert
  with check (
    public.is_dev_or_admin()
    and public.channel_is_dm(channel_id)
    and (
      user_id = auth.uid()
      or exists (
        select 1 from public.channel_members existing
        where existing.channel_id = channel_members.channel_id
        and existing.user_id = auth.uid()
      )
    )
  );
