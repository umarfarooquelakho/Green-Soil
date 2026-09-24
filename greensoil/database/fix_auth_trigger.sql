-- ============================================================
-- GREEN SOIL — Fix "Database error saving new user"
-- 
-- ONLY run this file — NOT schema.sql again.
-- Supabase Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- Step 1: Drop old trigger + function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop function if exists public.handle_new_user();

-- Step 2: Recreate function with search_path (THE critical fix)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_role_id uuid;
begin
  select id into v_customer_role_id
  from public.roles
  where name = 'CUSTOMER'
  limit 1;

  insert into public.profiles (id, full_name, phone, role_id, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), null),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), ''),
    v_customer_role_id,
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;

exception when others then
  raise warning 'handle_new_user failed for %: % %', new.id, sqlerrm, sqlstate;
  return new;
end;
$$;

-- Step 3: Re-attach trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Step 4: Grant permissions
grant execute on function public.handle_new_user() to supabase_auth_admin;
grant execute on function public.handle_new_user() to postgres;
grant insert, select on public.profiles to supabase_auth_admin;
grant select on public.roles to supabase_auth_admin;

-- Step 5: Ensure CUSTOMER role exists
insert into public.roles (name, description) values ('CUSTOMER', 'Regular customer')
on conflict (name) do nothing;

-- Confirm trigger is active
select trigger_name, event_object_table
from information_schema.triggers
where trigger_name = 'on_auth_user_created';
