-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Zorgt dat een DM-kanaal nooit meer dan 2 leden kan krijgen, ook niet via
-- een directe API-aanroep die de website-knoppen omzeilt.

create or replace function public.channel_member_count(cid uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.channel_members where channel_id = cid;
$$;

drop policy "Add members to own DM channels" on public.channel_members;

create policy "Add members to own DM channels"
  on public.channel_members for insert
  with check (
    public.is_dev_or_admin()
    and public.channel_is_dm(channel_id)
    and public.channel_member_count(channel_id) < 2
    and (
      user_id = auth.uid()
      or public.is_member_of(channel_id)
    )
  );
