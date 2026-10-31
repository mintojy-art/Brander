-- ORIC security lock-down — run ONCE in Supabase → SQL Editor → New query.
-- Safe to re-run. Restricts every admin permission to the accounts listed in
-- public.admin_users, instead of "any logged-in user".

-- 1. Admin allow-list (no API policies → nobody can read or edit it from the site)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admin_users enable row level security;

insert into public.admin_users (user_id)
select id from auth.users where lower(email) = 'mintojy@gmail.com'
on conflict do nothing;

-- 2. is_admin() — used by every admin-only policy
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 3. Rewrite every existing "logged-in user" policy to also require is_admin(),
--    keeping its original conditions (e.g. which storage bucket it covers).
do $$
declare
  p record;
  new_using text;
  new_check text;
begin
  for p in
    select schemaname, tablename, policyname, cmd, qual, with_check
    from pg_policies
    where roles = '{authenticated}'::name[]
      and schemaname in ('public', 'storage')
      and coalesce(qual, '') not like '%is_admin()%'
      and coalesce(with_check, '') not like '%is_admin()%'
  loop
    new_using := format('((%s) and public.is_admin())', coalesce(p.qual, 'true'));
    new_check := format('((%s) and public.is_admin())', coalesce(p.with_check, p.qual, 'true'));

    if p.cmd in ('SELECT', 'DELETE') then
      execute format('alter policy %I on %I.%I using %s', p.policyname, p.schemaname, p.tablename, new_using);
    elsif p.cmd = 'INSERT' then
      execute format('alter policy %I on %I.%I with check %s', p.policyname, p.schemaname, p.tablename, new_check);
    else
      execute format('alter policy %I on %I.%I using %s with check %s', p.policyname, p.schemaname, p.tablename, new_using, new_check);
    end if;
  end loop;
end $$;

-- 4. Job applications can be inserted straight through the public API, so
--    enforce sane limits in the database itself (not just the website form).
--    NOT VALID = checks new rows only, existing applications are untouched.
alter table public.job_applications drop constraint if exists job_applications_limits;
alter table public.job_applications add constraint job_applications_limits check (
  char_length(name) <= 100
  and char_length(email) <= 254
  and char_length(coalesce(phone, '')) <= 30
  and char_length(coalesce(message, '')) <= 5000
  and (portfolio_url is null or (char_length(portfolio_url) <= 500 and portfolio_url ~* '^https?://'))
) not valid;

-- 5. Verify: should list your email, and every policy should mention is_admin()
select u.email as admin_account from public.admin_users a join auth.users u on u.id = a.user_id;
select schemaname, tablename, policyname, cmd, coalesce(qual, with_check) as rule
from pg_policies
where roles = '{authenticated}'::name[] and schemaname in ('public', 'storage')
order by schemaname, tablename;
