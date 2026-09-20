-- FindMatch Stage 8: user activity and ownership-safe report management
-- Review this entire migration, then run it once in the Supabase SQL Editor.

begin;

-- Normal application users may edit report content, but system-controlled
-- ownership, workflow, and audit fields remain immutable through the Data API.
create or replace function public.protect_report_system_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.reporter_id is distinct from old.reporter_id
     or new.status is distinct from old.status
     or new.created_at is distinct from old.created_at
     or new.updated_at is distinct from old.updated_at then
    raise exception 'Report ownership, status, and audit fields cannot be changed by this user'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists lost_items_protect_system_fields on public.lost_items;
create trigger lost_items_protect_system_fields
before update on public.lost_items
for each row execute function public.protect_report_system_fields();

drop trigger if exists found_items_protect_system_fields on public.found_items;
create trigger found_items_protect_system_fields
before update on public.found_items
for each row execute function public.protect_report_system_fields();

-- Claims are durable activity history. Client-side owners and administrators
-- cannot delete a found report once any claim references it. A database operator
-- may still perform an intentional maintenance operation from the SQL Editor.
create or replace function public.protect_found_report_claim_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return old;
  end if;

  if exists (
    select 1
    from public.claims c
    where c.found_item_id = old.id
  ) then
    raise exception 'This found report has claim history and cannot be deleted'
      using errcode = 'P0001';
  end if;

  return old;
end;
$$;

drop trigger if exists found_items_protect_claim_history on public.found_items;
create trigger found_items_protect_claim_history
before delete on public.found_items
for each row execute function public.protect_found_report_claim_history();

-- Returns only reports owned by the authenticated viewer. reporter_id and
-- finder-only private_details are intentionally excluded from this activity list.
create or replace function public.get_my_reports()
returns table (
  report_type text,
  report_id uuid,
  item_name text,
  category text,
  brand text,
  color text,
  description text,
  location text,
  item_date date,
  image_path text,
  report_status public.item_report_status,
  report_created_at timestamptz,
  report_updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select auth.uid() as user_id
  )
  select
    'lost'::text,
    l.id,
    l.item_name,
    l.category,
    l.brand,
    l.color,
    l.description,
    l.location,
    l.item_date,
    l.image_path,
    l.status,
    l.created_at,
    l.updated_at
  from public.lost_items l
  cross join viewer v
  where v.user_id is not null
    and l.reporter_id = v.user_id

  union all

  select
    'found'::text,
    f.id,
    f.item_name,
    f.category,
    f.brand,
    f.color,
    f.description,
    f.location,
    f.item_date,
    f.image_path,
    f.status,
    f.created_at,
    f.updated_at
  from public.found_items f
  cross join viewer v
  where v.user_id is not null
    and f.reporter_id = v.user_id
  order by 12 desc;
$$;

-- Returns only claims submitted by the authenticated viewer. Finder-only
-- details, claimant proof, reviewer identity, and other users' claims are omitted.
create or replace function public.get_my_claim_activity()
returns table (
  claim_id uuid,
  found_item_id uuid,
  found_item_name text,
  claim_status public.claim_status,
  submitted_at timestamptz,
  admin_response text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.found_item_id,
    f.item_name,
    c.status,
    c.created_at,
    c.admin_response
  from public.claims c
  join public.found_items f on f.id = c.found_item_id
  where auth.uid() is not null
    and c.claimant_id = auth.uid()
  order by c.created_at desc;
$$;

-- Supplies an edit form only to the original reporter or an administrator.
-- reporter_id is used for authorization but is never returned to the client.
create or replace function public.get_manageable_report(
  target_type text,
  target_id uuid
)
returns table (
  report_type text,
  report_id uuid,
  item_name text,
  category text,
  brand text,
  color text,
  description text,
  private_details text,
  location text,
  item_date date,
  image_path text,
  report_status public.item_report_status,
  report_created_at timestamptz,
  is_owner boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select
      auth.uid() as user_id,
      coalesce(private.is_admin(), false) as is_admin
  )
  select
    'lost'::text,
    l.id,
    l.item_name,
    l.category,
    l.brand,
    l.color,
    l.description,
    null::text,
    l.location,
    l.item_date,
    l.image_path,
    l.status,
    l.created_at,
    l.reporter_id = v.user_id
  from public.lost_items l
  cross join viewer v
  where lower(target_type) = 'lost'
    and l.id = target_id
    and v.user_id is not null
    and (l.reporter_id = v.user_id or v.is_admin)

  union all

  select
    'found'::text,
    f.id,
    f.item_name,
    f.category,
    f.brand,
    f.color,
    f.description,
    f.private_details,
    f.location,
    f.item_date,
    f.image_path,
    f.status,
    f.created_at,
    f.reporter_id = v.user_id
  from public.found_items f
  cross join viewer v
  where lower(target_type) = 'found'
    and f.id = target_id
    and v.user_id is not null
    and (f.reporter_id = v.user_id or v.is_admin)
  limit 1;
$$;

-- Keep privacy-safe found-item details available to a claimant after a claim is
-- completed. This lets activity-history links remain useful even after another
-- claim resolves the listing; no proof or finder-only field is returned.
create or replace function public.get_item_detail(
  target_type text,
  target_id uuid
)
returns table (
  report_type text,
  item_id uuid,
  item_name text,
  category text,
  brand text,
  color text,
  description text,
  location text,
  item_date date,
  image_path text,
  item_status public.item_report_status,
  item_created_at timestamptz,
  item_updated_at timestamptz,
  reporter_label text,
  is_own_report boolean,
  is_claimable boolean,
  has_active_claim boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select
      auth.uid() as user_id,
      coalesce(private.is_admin(), false) as is_admin
  )
  select
    'lost'::text,
    l.id,
    l.item_name,
    l.category,
    l.brand,
    l.color,
    l.description,
    l.location,
    l.item_date,
    l.image_path,
    l.status,
    l.created_at,
    l.updated_at,
    case
      when l.reporter_id = v.user_id then 'You'
      when nullif(trim(p.first_name), '') is not null then
        trim(p.first_name) || case
          when nullif(trim(p.last_name), '') is not null then ' ' || left(trim(p.last_name), 1) || '.'
          else ''
        end
      else 'Campus community member'
    end,
    coalesce(l.reporter_id = v.user_id, false),
    false,
    false
  from public.lost_items l
  left join public.profiles p on p.id = l.reporter_id
  cross join viewer v
  where lower(target_type) = 'lost'
    and l.id = target_id
    and (
      l.status in ('open', 'matched')
      or l.reporter_id = v.user_id
      or v.is_admin
    )

  union all

  select
    'found'::text,
    f.id,
    f.item_name,
    f.category,
    f.brand,
    f.color,
    f.description,
    f.location,
    f.item_date,
    f.image_path,
    f.status,
    f.created_at,
    f.updated_at,
    case
      when f.reporter_id = v.user_id then 'You'
      when nullif(trim(p.first_name), '') is not null then
        trim(p.first_name) || case
          when nullif(trim(p.last_name), '') is not null then ' ' || left(trim(p.last_name), 1) || '.'
          else ''
        end
      else 'Campus community member'
    end,
    coalesce(f.reporter_id = v.user_id, false),
    (
      v.user_id is not null
      and f.status = 'open'
      and f.reporter_id <> v.user_id
      and not exists (
        select 1
        from public.claims c
        where c.found_item_id = f.id
          and c.claimant_id = v.user_id
          and c.status in ('pending', 'under_review', 'approved')
      )
    ),
    (
      v.user_id is not null
      and exists (
        select 1
        from public.claims c
        where c.found_item_id = f.id
          and c.claimant_id = v.user_id
          and c.status in ('pending', 'under_review', 'approved')
      )
    )
  from public.found_items f
  left join public.profiles p on p.id = f.reporter_id
  cross join viewer v
  where lower(target_type) = 'found'
    and f.id = target_id
    and (
      f.status in ('open', 'matched')
      or f.reporter_id = v.user_id
      or v.is_admin
      or exists (
        select 1
        from public.claims c
        where c.found_item_id = f.id
          and c.claimant_id = v.user_id
      )
    )
  limit 1;
$$;

revoke all on function public.get_my_reports() from public, anon, authenticated;
revoke all on function public.get_my_claim_activity() from public, anon, authenticated;
revoke all on function public.get_manageable_report(text, uuid) from public, anon, authenticated;
revoke all on function public.get_item_detail(text, uuid) from public, anon, authenticated;

grant execute on function public.get_my_reports() to authenticated;
grant execute on function public.get_my_claim_activity() to authenticated;
grant execute on function public.get_manageable_report(text, uuid) to authenticated;
grant execute on function public.get_item_detail(text, uuid) to anon, authenticated;

revoke all on function public.protect_report_system_fields() from public, anon, authenticated;
revoke all on function public.protect_found_report_claim_history() from public, anon, authenticated;

commit;
