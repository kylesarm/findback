-- FindBack Stage 4: safe inputs for the explainable matching system
-- Run this migration in the Supabase SQL Editor before using Possible Matches.

begin;

-- This RPC deliberately returns only fields that are already safe to show in a
-- listing. reporter_id and found_items.private_details are never returned.
create or replace function public.get_item_matching_candidates()
returns table (
  report_type text,
  id uuid,
  item_name text,
  category text,
  brand text,
  color text,
  description text,
  location text,
  item_date date,
  image_path text,
  status public.item_report_status,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
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
  where (select auth.uid()) is not null
    and l.reporter_id = (select auth.uid())
    and l.status in ('open', 'matched')

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
  where (select auth.uid()) is not null
    and f.status = 'open'
    and f.reporter_id <> (select auth.uid());
$$;

revoke all on function public.get_item_matching_candidates() from public, anon;
grant execute on function public.get_item_matching_candidates() to authenticated;

commit;
