-- FindMatch Stage 3: application schema and authorization
-- Run this entire file once in the Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;
create schema if not exists private;

do $$
begin
  create type public.app_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.item_report_status as enum ('open', 'matched', 'resolved', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.claim_status as enum ('pending', 'under_review', 'approved', 'rejected', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  display_name text,
  campus_id text,
  department text,
  phone text,
  avatar_path text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_not_blank check (length(trim(email)) > 3),
  constraint profiles_campus_id_length check (campus_id is null or length(campus_id) <= 80),
  constraint profiles_avatar_path_length check (avatar_path is null or length(avatar_path) <= 500)
);

create unique index if not exists profiles_email_lower_idx on public.profiles (lower(email));
create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.lost_items (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  item_name text not null,
  category text not null,
  brand text,
  color text,
  description text not null,
  location text not null,
  item_date date not null,
  image_path text,
  status public.item_report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lost_items_name_length check (length(trim(item_name)) between 2 and 120),
  constraint lost_items_category_length check (length(trim(category)) between 2 and 80),
  constraint lost_items_description_length check (length(trim(description)) between 10 and 2000),
  constraint lost_items_location_length check (length(trim(location)) between 2 and 200),
  constraint lost_items_image_path_length check (image_path is null or length(image_path) <= 500)
);

create index if not exists lost_items_reporter_idx on public.lost_items (reporter_id);
create index if not exists lost_items_status_created_idx on public.lost_items (status, created_at desc);
create index if not exists lost_items_category_idx on public.lost_items (category);
create index if not exists lost_items_date_idx on public.lost_items (item_date desc);

create table if not exists public.found_items (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  item_name text not null,
  category text not null,
  brand text,
  color text,
  description text not null,
  private_details text,
  location text not null,
  item_date date not null,
  image_path text,
  status public.item_report_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint found_items_name_length check (length(trim(item_name)) between 2 and 120),
  constraint found_items_category_length check (length(trim(category)) between 2 and 80),
  constraint found_items_description_length check (length(trim(description)) between 10 and 2000),
  constraint found_items_private_details_length check (private_details is null or length(trim(private_details)) between 3 and 3000),
  constraint found_items_location_length check (length(trim(location)) between 2 and 200),
  constraint found_items_image_path_length check (image_path is null or length(image_path) <= 500)
);

create index if not exists found_items_reporter_idx on public.found_items (reporter_id);
create index if not exists found_items_status_created_idx on public.found_items (status, created_at desc);
create index if not exists found_items_category_idx on public.found_items (category);
create index if not exists found_items_date_idx on public.found_items (item_date desc);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  claimant_id uuid not null references auth.users (id) on delete cascade,
  found_item_id uuid not null references public.found_items (id) on delete cascade,
  proof_description text not null,
  status public.claim_status not null default 'pending',
  admin_response text,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claims_proof_length check (length(trim(proof_description)) between 10 and 3000),
  constraint claims_admin_response_length check (admin_response is null or length(admin_response) <= 3000)
);

create index if not exists claims_claimant_idx on public.claims (claimant_id);
create index if not exists claims_found_item_idx on public.claims (found_item_id);
create index if not exists claims_status_created_idx on public.claims (status, created_at desc);
create unique index if not exists claims_one_active_per_user_item_idx
  on public.claims (claimant_id, found_item_id)
  where status in ('pending', 'under_review', 'approved');
create unique index if not exists claims_one_approved_per_found_item_idx
  on public.claims (found_item_id)
  where status = 'approved';

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  message text not null,
  notification_type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_message_length check (length(trim(message)) between 1 and 1000),
  constraint notifications_type_length check (length(trim(notification_type)) between 2 and 80)
);

create index if not exists notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx on public.notifications (recipient_id, is_read) where is_read = false;

-- Shared timestamp maintenance.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists lost_items_set_updated_at on public.lost_items;
create trigger lost_items_set_updated_at before update on public.lost_items
for each row execute function public.set_updated_at();

drop trigger if exists found_items_set_updated_at on public.found_items;
create trigger found_items_set_updated_at before update on public.found_items
for each row execute function public.set_updated_at();

drop trigger if exists claims_set_updated_at on public.claims;
create trigger claims_set_updated_at before update on public.claims
for each row execute function public.set_updated_at();

drop trigger if exists notifications_set_updated_at on public.notifications;
create trigger notifications_set_updated_at before update on public.notifications
for each row execute function public.set_updated_at();

-- Admin authorization is read from a database-controlled column, not user metadata.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Claim policies use these helpers so client roles never need SELECT access
-- to the internal found_items.reporter_id column.
create or replace function private.is_found_item_reporter(target_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.found_items f
    where f.id = target_item_id
      and f.reporter_id = (select auth.uid())
  );
$$;

create or replace function private.is_found_item_claimable(target_item_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.found_items f
    where f.id = target_item_id
      and f.status = 'open'
      and f.reporter_id <> (select auth.uid())
  );
$$;

revoke all on function private.is_found_item_reporter(uuid) from public;
revoke all on function private.is_found_item_claimable(uuid) from public;
grant execute on function private.is_found_item_reporter(uuid) to authenticated;
grant execute on function private.is_found_item_claimable(uuid) to authenticated;

-- Keep authorization fields immutable to normal authenticated users.
create or replace function public.protect_profile_authorization_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.email is distinct from old.email
     or new.role is distinct from old.role
     or new.created_at is distinct from old.created_at then
    if not private.is_admin() then
      raise exception 'Profile authorization fields cannot be changed by this user';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_authorization on public.profiles;
create trigger profiles_protect_authorization before update on public.profiles
for each row execute function public.protect_profile_authorization_fields();

-- Claimants may clarify pending proof, but only admins may decide claims.
create or replace function public.protect_claim_decision_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or private.is_admin() then
    return new;
  end if;

  if old.claimant_id <> (select auth.uid())
     or old.status <> 'pending'
     or new.id is distinct from old.id
     or new.claimant_id is distinct from old.claimant_id
     or new.found_item_id is distinct from old.found_item_id
     or new.status is distinct from old.status
     or new.admin_response is distinct from old.admin_response
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.created_at is distinct from old.created_at then
    raise exception 'Only administrators can change claim decisions';
  end if;

  return new;
end;
$$;

drop trigger if exists claims_protect_decisions on public.claims;
create trigger claims_protect_decisions before update on public.claims
for each row execute function public.protect_claim_decision_fields();

-- A finder cannot claim their own report, even through a privileged write path.
create or replace function private.validate_claim_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.found_items f
    where f.id = new.found_item_id
      and f.reporter_id = new.claimant_id
  ) then
    raise exception 'A reporter cannot claim their own found item';
  end if;

  return new;
end;
$$;

revoke all on function private.validate_claim_submission() from public;

drop trigger if exists claims_validate_submission on public.claims;
create trigger claims_validate_submission
before insert or update of claimant_id, found_item_id on public.claims
for each row execute function private.validate_claim_submission();

-- Recipients can mark a notification read; message content is system/admin controlled.
create or replace function public.protect_notification_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') or private.is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.recipient_id is distinct from old.recipient_id
     or new.message is distinct from old.message
     or new.notification_type is distinct from old.notification_type
     or new.created_at is distinct from old.created_at then
    raise exception 'Users may only change notification read status';
  end if;

  return new;
end;
$$;

drop trigger if exists notifications_protect_content on public.notifications;
create trigger notifications_protect_content before update on public.notifications
for each row execute function public.protect_notification_content();

-- Create a profile when Supabase Auth creates a user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, email, first_name, last_name, display_name, campus_id
  )
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      trim(concat(
        new.raw_user_meta_data ->> 'first_name',
        ' ',
        new.raw_user_meta_data ->> 'last_name'
      ))
    ),
    new.raw_user_meta_data ->> 'campus_id'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill profiles for users who registered before this migration.
insert into public.profiles (id, email, first_name, last_name, display_name, campus_id)
select
  u.id,
  coalesce(u.email, ''),
  u.raw_user_meta_data ->> 'first_name',
  u.raw_user_meta_data ->> 'last_name',
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    trim(concat(
      u.raw_user_meta_data ->> 'first_name',
      ' ',
      u.raw_user_meta_data ->> 'last_name'
    ))
  ),
  u.raw_user_meta_data ->> 'campus_id'
from auth.users u
on conflict (id) do nothing;

-- RLS is enabled explicitly for every application table.
alter table public.profiles enable row level security;
alter table public.lost_items enable row level security;
alter table public.found_items enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;

-- Remove broad defaults before adding least-privilege grants.
revoke all on public.profiles from anon, authenticated;
revoke all on public.lost_items from anon, authenticated;
revoke all on public.found_items from anon, authenticated;
revoke all on public.claims from anon, authenticated;
revoke all on public.notifications from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select (
  id, item_name, category, brand, color, description, location,
  item_date, image_path, status, created_at, updated_at
) on public.lost_items to anon, authenticated;
grant select (
  id, item_name, category, brand, color, description, location,
  item_date, image_path, status, created_at, updated_at
) on public.found_items to anon, authenticated;
grant insert, update, delete on public.lost_items, public.found_items to authenticated;
grant select, insert, update, delete on public.claims to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

grant usage on type public.app_role, public.item_report_status, public.claim_status to authenticated;
grant usage on type public.item_report_status to anon;

-- Profiles: self-service fields for the owner; administrators retain database-level access.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id and role = 'user');

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select private.is_admin()))
with check ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
on public.profiles for delete to authenticated
using ((select private.is_admin()));

-- Lost listings: open/matched reports are readable; mutations remain owner/admin only.
drop policy if exists "lost_items_read_listings" on public.lost_items;
drop policy if exists "lost_items_read_public" on public.lost_items;
create policy "lost_items_read_public"
on public.lost_items for select to anon, authenticated
using (status in ('open', 'matched'));

drop policy if exists "lost_items_read_own_or_admin" on public.lost_items;
create policy "lost_items_read_own_or_admin"
on public.lost_items for select to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "lost_items_insert_own" on public.lost_items;
create policy "lost_items_insert_own"
on public.lost_items for insert to authenticated
with check ((select auth.uid()) is not null and reporter_id = (select auth.uid()));

drop policy if exists "lost_items_update_own_or_admin" on public.lost_items;
create policy "lost_items_update_own_or_admin"
on public.lost_items for update to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()))
with check (reporter_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "lost_items_delete_own_or_admin" on public.lost_items;
create policy "lost_items_delete_own_or_admin"
on public.lost_items for delete to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

-- Found listings follow the same ownership model.
drop policy if exists "found_items_read_listings" on public.found_items;
drop policy if exists "found_items_read_public" on public.found_items;
create policy "found_items_read_public"
on public.found_items for select to anon, authenticated
using (status in ('open', 'matched'));

drop policy if exists "found_items_read_own_or_admin" on public.found_items;
create policy "found_items_read_own_or_admin"
on public.found_items for select to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "found_items_insert_own" on public.found_items;
create policy "found_items_insert_own"
on public.found_items for insert to authenticated
with check ((select auth.uid()) is not null and reporter_id = (select auth.uid()));

drop policy if exists "found_items_update_own_or_admin" on public.found_items;
create policy "found_items_update_own_or_admin"
on public.found_items for update to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()))
with check (reporter_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "found_items_delete_own_or_admin" on public.found_items;
create policy "found_items_delete_own_or_admin"
on public.found_items for delete to authenticated
using (reporter_id = (select auth.uid()) or (select private.is_admin()));

-- Claims and verification proof are never public.
drop policy if exists "claims_select_involved_or_admin" on public.claims;
create policy "claims_select_involved_or_admin"
on public.claims for select to authenticated
using (
  claimant_id = (select auth.uid())
  or (select private.is_found_item_reporter(found_item_id))
  or (select private.is_admin())
);

drop policy if exists "claims_insert_own" on public.claims;
create policy "claims_insert_own"
on public.claims for insert to authenticated
with check (
  claimant_id = (select auth.uid())
  and status = 'pending'
  and (select private.is_found_item_claimable(found_item_id))
);

drop policy if exists "claims_update_own_pending_or_admin" on public.claims;
create policy "claims_update_own_pending_or_admin"
on public.claims for update to authenticated
using (
  (claimant_id = (select auth.uid()) and status = 'pending')
  or (select private.is_admin())
)
with check (
  claimant_id = (select auth.uid())
  or (select private.is_admin())
);

drop policy if exists "claims_delete_own_pending_or_admin" on public.claims;
create policy "claims_delete_own_pending_or_admin"
on public.claims for delete to authenticated
using (
  (claimant_id = (select auth.uid()) and status = 'pending')
  or (select private.is_admin())
);

-- Notifications are private to their recipient; only admins may create content.
drop policy if exists "notifications_select_recipient_or_admin" on public.notifications;
create policy "notifications_select_recipient_or_admin"
on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "notifications_insert_admin" on public.notifications;
create policy "notifications_insert_admin"
on public.notifications for insert to authenticated
with check ((select private.is_admin()));

drop policy if exists "notifications_update_recipient_or_admin" on public.notifications;
create policy "notifications_update_recipient_or_admin"
on public.notifications for update to authenticated
using (recipient_id = (select auth.uid()) or (select private.is_admin()))
with check (recipient_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists "notifications_delete_recipient_or_admin" on public.notifications;
create policy "notifications_delete_recipient_or_admin"
on public.notifications for delete to authenticated
using (recipient_id = (select auth.uid()) or (select private.is_admin()));

-- Safe projections for browse screens. Verification proof is never included.
create or replace view public.lost_item_listings
with (security_invoker = true)
as
select id, item_name, category, brand, color, description, location,
       item_date, image_path, status, created_at, updated_at
from public.lost_items
where status in ('open', 'matched');

create or replace view public.found_item_listings
with (security_invoker = true)
as
select id, item_name, category, brand, color, description, location,
       item_date, image_path, status, created_at, updated_at
from public.found_items
where status in ('open', 'matched');

revoke all on public.lost_item_listings, public.found_item_listings from public;
grant select on public.lost_item_listings, public.found_item_listings to anon, authenticated;

-- Finder-only verification details are retrieved through this checked RPC.
-- The base-table SELECT grants above intentionally exclude both reporter_id
-- and private_details for every client role.
create or replace function public.get_found_item_private_details(target_item_id uuid)
returns table (found_item_id uuid, private_details text)
language sql
stable
security definer
set search_path = ''
as $$
  select f.id, f.private_details
  from public.found_items f
  where f.id = target_item_id
    and f.private_details is not null
    and (
      f.reporter_id = (select auth.uid())
      or (select private.is_admin())
    );
$$;

revoke all on function public.get_found_item_private_details(uuid) from public, anon;
grant execute on function public.get_found_item_private_details(uuid) to authenticated;

-- Trigger helpers are not callable through the Data API.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.protect_profile_authorization_fields() from public, anon, authenticated;
revoke all on function public.protect_claim_decision_fields() from public, anon, authenticated;
revoke all on function public.protect_notification_content() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

commit;

-- After the migration, promote an administrator only from the SQL Editor:
-- update public.profiles set role = 'admin' where email = 'admin@your-campus.edu';
