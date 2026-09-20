-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Automatically deletes chat messages and their files after 90 days, limiting
-- the amount of conversation history exposed in a potential security breach.

create or replace function public.cleanup_old_chat_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cutoff timestamptz := now() - interval '90 days';
begin
  -- Delete the actual Storage files first while their paths are still available,
  -- before the rows below are removed.
  delete from storage.objects
  where bucket_id = 'chat-files'
  and name in (
    select a.storage_path
    from public.attachments a
    join public.messages m on m.id = a.message_id
    where m.created_at < cutoff
  );

  -- The related attachment rows are also deleted automatically through the cascade.
  delete from public.messages where created_at < cutoff;
end;
$$;

grant execute on function public.cleanup_old_chat_data() to authenticated;

-- Preferred approach: run automatically every night through the database.
-- This requires the pg_cron extension. If the two statements below fail
-- (for example, because it is unavailable on the free plan), skip them:
-- the app has a fallback mechanism that performs the same cleanup.
create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'cleanup-old-chat-data',
  '0 3 * * *',
  $$select public.cleanup_old_chat_data();$$
);
