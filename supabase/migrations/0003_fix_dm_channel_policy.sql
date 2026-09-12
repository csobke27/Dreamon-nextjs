-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Repareert het starten van een nieuw DM-gesprek: de oude policy controleerde
-- of het kanaal bestaat via een gewone query op "channels", maar die tabel is
-- voor een gloednieuw DM-kanaal nog niet leesbaar voor jou (je bent er immers
-- nog geen lid van) -> kip-ei probleem. Deze functie omzeilt dat bewust.

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
