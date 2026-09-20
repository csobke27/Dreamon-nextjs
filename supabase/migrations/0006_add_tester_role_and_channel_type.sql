-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Adds the new enum values. This must run separately from 0007; otherwise,
-- Postgres returns "unsafe use of new value" because a newly added enum value
-- cannot be used in the same transaction.

alter type public.app_role add value if not exists 'tester';
alter type public.channel_type add value if not exists 'testers';
