-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Verwijdert automatisch chatberichten (en hun bestanden) ouder dan 90 dagen,
-- zodat er bij een eventuele hack niet jarenlang geschiedenis buit te maken is.

create or replace function public.cleanup_old_chat_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - interval '90 days';
begin
  -- Eerst de daadwerkelijke bestanden uit Storage verwijderen, terwijl we
  -- de paden nog weten (voordat de rijen hieronder verdwijnen).
  delete from storage.objects
  where bucket_id = 'chat-files'
  and name in (
    select a.storage_path
    from public.attachments a
    join public.messages m on m.id = a.message_id
    where m.created_at < cutoff
  );

  -- Verwijdert automatisch ook de bijbehorende attachments-rijen (cascade).
  delete from public.messages where created_at < cutoff;
end;
$$;

grant execute on function public.cleanup_old_chat_data() to authenticated;

-- Beste manier: elke nacht automatisch laten draaien via de database zelf.
-- Dit vereist de pg_cron extensie. Als de onderstaande 2 statements een fout
-- geven (bijv. niet beschikbaar op het gratis plan), sla ze dan gewoon over:
-- de app heeft een backup-mechanisme dat hetzelfde doet.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'cleanup-old-chat-data',
  '0 3 * * *',
  $$select public.cleanup_old_chat_data();$$
);
