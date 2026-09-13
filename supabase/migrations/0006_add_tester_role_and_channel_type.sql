-- Voer dit eenmalig uit in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Voegt de nieuwe waarden toe. Moet in een APARTE run staan van 0007, anders
-- geeft Postgres een fout ("unsafe use of new value") omdat je een net
-- toegevoegde enum-waarde niet in dezelfde transactie mag gebruiken.

alter type public.app_role add value if not exists 'tester';
alter type public.channel_type add value if not exists 'testers';
