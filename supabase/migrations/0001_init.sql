-- NameVoid schema
-- Profiles, searches, and per-name results with row level security.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, tracks entitlement + free usage
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  has_lifetime_pass boolean not null default false,
  free_searches_used integer not null default 0,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles are written by the server (service role) only, so no insert/update
-- policy is granted to regular users. Entitlement can never be self-granted.

-- Auto-create a profile whenever a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- searches: one row per brainstorm/research run
-- ---------------------------------------------------------------------------
create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  status text not null default 'complete',
  created_at timestamptz not null default now()
);

alter table public.searches enable row level security;

drop policy if exists "searches_select_own" on public.searches;
create policy "searches_select_own"
  on public.searches for select
  using (auth.uid() = user_id);

create index if not exists searches_user_id_created_idx
  on public.searches (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- name_results: one row per candidate name within a search
-- ---------------------------------------------------------------------------
create table if not exists public.name_results (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.searches (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  -- 'available' | 'taken' | 'uncertain'
  status text not null,
  confidence integer not null default 0,
  reasoning text,
  -- [{ "title": "...", "url": "..." }]
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.name_results enable row level security;

drop policy if exists "name_results_select_own" on public.name_results;
create policy "name_results_select_own"
  on public.name_results for select
  using (auth.uid() = user_id);

create index if not exists name_results_search_id_idx
  on public.name_results (search_id);

-- ---------------------------------------------------------------------------
-- RPC: atomically increment free search usage for non-pass users.
-- Returns the new count. Runs as the calling user (security invoker) but the
-- profiles update is allowed because it's defined as security definer.
-- ---------------------------------------------------------------------------
create or replace function public.increment_free_search(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.profiles
     set free_searches_used = free_searches_used + 1
   where id = p_user_id
  returning free_searches_used into new_count;
  return new_count;
end;
$$;
