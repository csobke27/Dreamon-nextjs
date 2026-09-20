-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- The previous fix checked membership by querying channel_members from within
-- a channel_members policy, causing "infinite recursion detected in policy".
-- This security-definer function bypasses that issue, as with the earlier
-- circular dependency.

create or replace function public.is_member_of(cid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.channel_members where channel_id = cid and user_id = auth.uid()
  );
$$;

drop policy "Add members to own DM channels" on public.channel_members;

create policy "Add members to own DM channels"
  on public.channel_members for insert
  with check (
    public.is_dev_or_admin()
    and public.channel_is_dm(channel_id)
    and (
      user_id = auth.uid()
      or public.is_member_of(channel_id)
    )
  );
