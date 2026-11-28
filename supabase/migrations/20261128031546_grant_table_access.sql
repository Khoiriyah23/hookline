-- This project does not grant table access automatically,
-- so we grant exactly what each role needs. Row-level security
-- still decides WHICH rows a user can see (only their own).

-- 1. Start clean: remove the broad defaults (including TRUNCATE, which ignores RLS).
revoke all on public.profiles, public.generations, public.usage_daily,
  public.subscriptions, public.prompt_templates
  from anon, authenticated;

-- 2. Server (service role key, server code only): full access.
grant select, insert, update, delete on public.profiles, public.generations,
  public.usage_daily, public.subscriptions, public.prompt_templates
  to service_role;

-- 3. Logged-in users: read their own data (RLS limits it to their rows).
grant select on public.profiles, public.generations, public.usage_daily,
  public.subscriptions
  to authenticated;

-- 4. Logged-in users can delete items from their own history.
grant delete on public.generations to authenticated;

-- 5. Logged-in users can edit their profile fields, but not plan, email or timestamps.
--    (Re-granted because step 1 also removed column permissions.)
grant update (full_name, headline, skills, years_experience, portfolio_links, bio, tone, onboarded)
  on public.profiles to authenticated;

-- anon (logged-out visitors) gets nothing: every table needs a login.