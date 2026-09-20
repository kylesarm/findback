-- FindMatch Module 3: globally paginated, privacy-safe browse listings
-- Review this migration, then run it in the Supabase SQL Editor.

begin;

-- This view combines the existing safe lost/found projections so PostgREST can
-- filter, sort, count, and paginate the complete result set in one query.
-- reporter_id, private_details, profile data, and claim proof are not exposed.
create or replace view public.item_listings
with (security_invoker = true)
as
select
  'lost'::text as report_type,
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
from public.lost_item_listings l

union all

select
  'found'::text as report_type,
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
from public.found_item_listings f;

revoke all on public.item_listings from public, anon, authenticated;
grant select on public.item_listings to anon, authenticated;

commit;
