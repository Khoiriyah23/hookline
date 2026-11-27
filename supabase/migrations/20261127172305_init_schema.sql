-- Hookline: initial schema
-- Tables: profiles, generations, usage_daily, subscriptions, prompt_templates
-- Row-level security: users only ever see their own rows.
-- Writes to usage, generations and subscriptions happen only on the server (service role).

-- ---------------------------------------------------------------------------
-- Shared helper: keep updated_at current
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. Profiles: one row per user, created automatically at sign-up
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  headline text not null default '',
  skills text[] not null default '{}',
  years_experience integer check (years_experience between 0 and 60),
  portfolio_links text[] not null default '{}',
  bio text not null default '' check (char_length(bio) <= 2000),
  tone text not null default 'professional'
    check (tone in ('professional', 'friendly', 'confident', 'concise')),
  plan text not null default 'free' check (plan in ('free', 'pro')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may edit their profile fields, but never their plan, email or timestamps.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, headline, skills, years_experience, portfolio_links, bio, tone, onboarded)
  on public.profiles to authenticated;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. Generations: every proposal / cover letter / cold email (History page)
-- ---------------------------------------------------------------------------
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('upwork', 'cover_letter', 'cold_email')),
  input_text text not null check (char_length(input_text) <= 15000),
  extras jsonb,
  output_text text not null default '',
  status text not null default 'streaming'
    check (status in ('streaming', 'completed', 'failed')),
  model text,
  input_tokens integer,
  output_tokens integer,
  regenerate_of uuid references public.generations (id) on delete set null,
  created_at timestamptz not null default now()
);

create index generations_user_created_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

create policy "Users can read their own generations"
  on public.generations for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own generations"
  on public.generations for delete to authenticated
  using ((select auth.uid()) = user_id);
-- No insert/update policy: only the server (service role) writes generations.

-- ---------------------------------------------------------------------------
-- 3. Daily usage: enforces the free-tier limit
-- ---------------------------------------------------------------------------
create table public.usage_daily (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  used integer not null default 0 check (used >= 0),
  primary key (user_id, usage_date)
);

alter table public.usage_daily enable row level security;

create policy "Users can read their own usage"
  on public.usage_daily for select to authenticated
  using ((select auth.uid()) = user_id);

-- Atomically use one generation from today's quota (UTC day).
-- Returns the new count, or NULL if the user has already reached p_limit.
create function public.consume_quota(p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_used integer;
begin
  insert into public.usage_daily as u (user_id, usage_date, used)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, usage_date)
  do update set used = u.used + 1
  where u.used < p_limit
  returning u.used into v_used;

  return v_used;
end;
$$;

-- Give one generation back (used when Claude fails mid-request).
create function public.refund_quota(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.usage_daily
  set used = used - 1
  where user_id = p_user_id
    and usage_date = (now() at time zone 'utc')::date
    and used > 0;
end;
$$;

-- Only the server may call the quota functions.
revoke execute on function public.consume_quota(uuid, integer) from public, anon, authenticated;
revoke execute on function public.refund_quota(uuid) from public, anon, authenticated;
grant execute on function public.consume_quota(uuid, integer) to service_role;
grant execute on function public.refund_quota(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4. Subscriptions: synced from Stripe webhooks
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Prompt templates: tune prompts without redeploying (server-only)
-- ---------------------------------------------------------------------------
create table public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('upwork', 'cover_letter', 'cold_email')),
  version integer not null default 1,
  system_prompt text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (mode, version)
);

-- Only one active template per mode.
create unique index prompt_templates_one_active_per_mode
  on public.prompt_templates (mode) where active;

alter table public.prompt_templates enable row level security;
-- No policies: only the server (service role) can read or change templates.