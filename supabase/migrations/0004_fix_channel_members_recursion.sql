-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- De vorige fix checkte lidmaatschap met een query op channel_members binnen
-- een policy VAN channel_members zelf -> "infinite recursion detected in
-- policy". Deze functie (security definer) omzeilt dat, net als bij de
-- eerdere kip-ei problemen.

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
