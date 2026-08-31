-- FindBack Stage 7: privacy-safe item details and direct claim eligibility
-- Review this entire migration, then run it once in the Supabase SQL Editor.

begin;

-- Returns one safe item-detail record. It never returns reporter_id, email,
-- phone, private_details, claim proof, or any other private profile field.
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
          and c.status in ('pending', 'under_review', 'approved')
      )
    )
  limit 1;
$$;

revoke all on function public.get_item_detail(text, uuid) from public, anon, authenticated;
grant execute on function public.get_item_detail(text, uuid) to anon, authenticated;

commit;
