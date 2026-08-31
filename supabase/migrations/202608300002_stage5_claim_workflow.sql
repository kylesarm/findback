-- FindBack Stage 5: claims and claim-verification workflow
-- Review this entire migration, then run it in the Supabase SQL Editor.

begin;

create index if not exists claims_found_item_status_idx
  on public.claims (found_item_id, status, created_at desc);

-- Return only claims the current user is already entitled to see as the
-- claimant, finder, or an administrator. Finder verification details are
-- returned only to the original finder and administrators.
create or replace function public.get_claims_workspace()
returns table (
  claim_id uuid,
  found_item_id uuid,
  proof_description text,
  claim_status public.claim_status,
  admin_response text,
  reviewed_at timestamptz,
  claim_created_at timestamptz,
  claim_updated_at timestamptz,
  viewer_role text,
  claimant_name text,
  claimant_email text,
  found_item_name text,
  found_category text,
  found_brand text,
  found_color text,
  found_description text,
  found_location text,
  found_item_date date,
  found_status public.item_report_status,
  private_details text
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
    c.id,
    c.found_item_id,
    c.proof_description,
    c.status,
    c.admin_response,
    c.reviewed_at,
    c.created_at,
    c.updated_at,
    case
      when v.is_admin then 'admin'
      when f.reporter_id = v.user_id then 'finder'
      else 'claimant'
    end,
    case
      when v.is_admin then coalesce(
        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
        nullif(p.display_name, ''),
        'Claimant'
      )
      else null
    end,
    case when v.is_admin then p.email else null end,
    f.item_name,
    f.category,
    f.brand,
    f.color,
    f.description,
    f.location,
    f.item_date,
    f.status,
    case
      when v.is_admin or f.reporter_id = v.user_id then f.private_details
      else null
    end
  from public.claims c
  join public.found_items f on f.id = c.found_item_id
  left join public.profiles p on p.id = c.claimant_id
  cross join viewer v
  where v.user_id is not null
    and (
      c.claimant_id = v.user_id
      or f.reporter_id = v.user_id
      or v.is_admin
    )
  order by c.created_at desc;
$$;

revoke all on function public.get_claims_workspace() from public, anon;
grant execute on function public.get_claims_workspace() to authenticated;

-- Claimants can withdraw only their own active claim. Direct client updates to
-- decision fields remain blocked by the existing protection trigger.
create or replace function public.cancel_my_claim(target_claim_id uuid)
returns public.claim_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  result_status public.claim_status;
begin
  if viewer_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  update public.claims
  set status = 'cancelled'
  where id = target_claim_id
    and claimant_id = viewer_id
    and status in ('pending', 'under_review')
  returning status into result_status;

  if result_status is null then
    raise exception 'This claim cannot be cancelled' using errcode = 'P0001';
  end if;

  return result_status;
end;
$$;

revoke all on function public.cancel_my_claim(uuid) from public, anon;
grant execute on function public.cancel_my_claim(uuid) to authenticated;

-- Admin decisions are performed atomically. The found-item row is locked first
-- so concurrent approval attempts serialize safely. The Stage 3 partial unique
-- index remains the final database-level guarantee of one approval per item.
create or replace function public.review_claim(
  target_claim_id uuid,
  decision public.claim_status,
  response text default null
)
returns public.claim_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewer_id uuid := auth.uid();
  target_found_item_id uuid;
  current_claim_status public.claim_status;
  current_found_status public.item_report_status;
  clean_response text := nullif(trim(coalesce(response, '')), '');
begin
  if reviewer_id is null or not coalesce(private.is_admin(), false) then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if decision is null or decision not in ('under_review', 'approved', 'rejected') then
    raise exception 'Unsupported claim decision' using errcode = '22023';
  end if;

  if clean_response is not null and length(clean_response) > 3000 then
    raise exception 'Admin response is too long' using errcode = '22001';
  end if;

  if decision = 'rejected' and coalesce(length(clean_response), 0) < 3 then
    raise exception 'A rejection reason is required' using errcode = '22023';
  end if;

  select c.found_item_id
  into target_found_item_id
  from public.claims c
  where c.id = target_claim_id;

  if target_found_item_id is null then
    raise exception 'Claim not found' using errcode = 'P0002';
  end if;

  select f.status
  into current_found_status
  from public.found_items f
  where f.id = target_found_item_id
  for update;

  if current_found_status is null then
    raise exception 'Found item not found' using errcode = 'P0002';
  end if;

  select c.status
  into current_claim_status
  from public.claims c
  where c.id = target_claim_id
    and c.found_item_id = target_found_item_id
  for update;

  if current_claim_status is null then
    raise exception 'Claim not found' using errcode = 'P0002';
  end if;

  if current_claim_status = decision then
    return current_claim_status;
  end if;

  if current_claim_status not in ('pending', 'under_review') then
    raise exception 'Only active claims can be reviewed' using errcode = 'P0001';
  end if;

  if decision = 'approved' then
    if current_found_status not in ('open', 'matched') then
      raise exception 'This found item is no longer available' using errcode = 'P0001';
    end if;

    update public.claims
    set
      status = 'approved',
      admin_response = clean_response,
      reviewed_by = reviewer_id,
      reviewed_at = now()
    where id = target_claim_id;

    update public.found_items
    set status = 'resolved'
    where id = target_found_item_id;

    update public.claims
    set
      status = 'rejected',
      admin_response = 'Another ownership claim for this item was approved.',
      reviewed_by = reviewer_id,
      reviewed_at = now()
    where found_item_id = target_found_item_id
      and id <> target_claim_id
      and status in ('pending', 'under_review');
  else
    update public.claims
    set
      status = decision,
      admin_response = clean_response,
      reviewed_by = reviewer_id,
      reviewed_at = now()
    where id = target_claim_id;
  end if;

  return decision;
end;
$$;

revoke all on function public.review_claim(uuid, public.claim_status, text) from public, anon;
grant execute on function public.review_claim(uuid, public.claim_status, text) to authenticated;

commit;
