-- =====================================================================
-- Stave — database schema for Supabase (run once in the SQL editor)
-- =====================================================================
-- Privacy design (students may be children):
--   * No email is collected. Students choose a username; the app signs them
--     up with a synthetic, non-deliverable address <username>@students.stave.invalid.
--     "Confirm email" MUST be turned off in Auth settings (see README).
--   * Profiles hold only a username and an optional nickname.
--   * Every table has row-level security: a student can read and write ONLY
--     their own rows. Nothing is public. The anon key alone can read nothing.
--   * Students can delete their account and all data (delete_own_account).
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS.
-- =====================================================================

-- ---------- profiles ----------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique
               check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null default ''
               check (char_length(display_name) <= 24),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- progress (one JSON document per student) ----------
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  version    integer not null default 2,
  updated_at timestamptz not null default now(),
  -- keep documents small; real progress is a few KB
  constraint progress_size check (pg_column_size(data) < 524288),
  constraint progress_is_object check (jsonb_typeof(data) = 'object')
);

-- ---------- updated_at maintenance ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- ---------- create a profile when a student signs up ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  uname text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
begin
  if uname !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid username';
  end if;
  insert into public.profiles (id, username) values (new.id, uname);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- row-level security ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "own profile: read"   on public.profiles;
drop policy if exists "own profile: update" on public.profiles;
create policy "own profile: read"   on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile: update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- no insert policy: profiles are created only by the signup trigger
-- usernames cannot be changed by clients:
-- (Supabase grants table-wide UPDATE to authenticated by default, so a
-- column-level revoke alone does nothing: revoke all updates, then allow
-- only the nickname.)
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

drop policy if exists "own progress: read"   on public.progress;
drop policy if exists "own progress: insert" on public.progress;
drop policy if exists "own progress: update" on public.progress;
create policy "own progress: read"   on public.progress for select to authenticated using (user_id = auth.uid());
create policy "own progress: insert" on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy "own progress: update" on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- anon gets nothing at all
revoke all on public.profiles from anon;
revoke all on public.progress from anon;

-- ---------- username availability (no data leak: returns only true/false) ----------
create or replace function public.username_available(name text) returns boolean
language sql security definer set search_path = public stable as $$
  select lower(name) ~ '^[a-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = lower(name));
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- ---------- delete own account and all data ----------
create or replace function public.delete_own_account() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();   -- cascades to profiles and progress
end $$;
-- (Supabase grants EXECUTE on new functions to anon by default; remove it.)
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
