-- FindMatch Module 6: event-driven, deduplicated notifications
-- Review this migration, then run it in the Supabase SQL Editor.

begin;

alter table public.notifications
  add column if not exists event_key text,
  add column if not exists target_path text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.notifications'::regclass
      and conname = 'notifications_event_key_length'
  ) then
    alter table public.notifications
      add constraint notifications_event_key_length
      check (event_key is null or length(event_key) between 3 and 500);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.notifications'::regclass
      and conname = 'notifications_target_path_safe'
  ) then
    alter table public.notifications
      add constraint notifications_target_path_safe
      check (
        target_path is null
        or (
          length(target_path) between 1 and 500
          and left(target_path, 1) = '/'
          and left(target_path, 2) <> '//'
        )
      );
  end if;
end $$;

create unique index if not exists notifications_recipient_event_key_idx
  on public.notifications (recipient_id, event_key)
  where event_key is not null;

-- Notification content is private to its recipient. Administrators generate
-- system events through checked functions but do not receive blanket read access.
drop policy if exists "notifications_select_recipient_or_admin" on public.notifications;
drop policy if exists "notifications_select_recipient" on public.notifications;
create policy "notifications_select_recipient"
on public.notifications for select to authenticated
using (recipient_id = (select auth.uid()));

-- Preserve the existing rule that recipients may change only read status.
-- The new event identity and destination fields are also system controlled.
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
     or new.event_key is distinct from old.event_key
     or new.target_path is distinct from old.target_path
     or new.created_at is distinct from old.created_at then
    raise exception 'Users may only change notification read status'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

-- All generated events use this helper so repeated processing is idempotent.
create or replace function private.insert_notification(
  target_recipient uuid,
  target_event_key text,
  target_message text,
  target_type text,
  destination_path text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if target_recipient is null
     or nullif(trim(target_event_key), '') is null
     or nullif(trim(target_message), '') is null
     or nullif(trim(target_type), '') is null then
    return false;
  end if;

  insert into public.notifications (
    recipient_id,
    message,
    notification_type,
    event_key,
    target_path
  )
  values (
    target_recipient,
    trim(target_message),
    trim(target_type),
    trim(target_event_key),
    destination_path
  )
  on conflict (recipient_id, event_key) where event_key is not null
  do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count = 1;
end;
$$;

revoke all on function private.insert_notification(uuid, text, text, text, text) from public, anon, authenticated;

-- Claim events are generated inside the same transaction as the claim change.
create or replace function private.notify_claim_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  finder_id uuid;
  found_name text;
begin
  select f.reporter_id, f.item_name
  into finder_id, found_name
  from public.found_items f
  where f.id = new.found_item_id;

  if finder_id is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    perform private.insert_notification(
      finder_id,
      'claim:new:' || new.id::text,
      format('A new ownership claim was submitted for "%s".', found_name),
      'new_claim',
      '/claims'
    );
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'under_review' then
    perform private.insert_notification(
      new.claimant_id,
      'claim:under-review:' || new.id::text,
      format('Your ownership claim for "%s" is now under review.', found_name),
      'claim_under_review',
      '/claims'
    );
  elsif new.status = 'approved' then
    perform private.insert_notification(
      new.claimant_id,
      'claim:approved:' || new.id::text,
      format('Your ownership claim for "%s" was approved.', found_name),
      'claim_approved',
      '/claims'
    );

    perform private.insert_notification(
      finder_id,
      'found:resolved:' || new.found_item_id::text || ':' || new.id::text,
      format('Your found-item report "%s" was resolved after an approved ownership claim.', found_name),
      'found_item_resolved',
      '/items/found/' || new.found_item_id::text
    );
  elsif new.status = 'rejected' then
    perform private.insert_notification(
      new.claimant_id,
      'claim:rejected:' || new.id::text,
      format('Your ownership claim for "%s" was rejected.', found_name),
      'claim_rejected',
      '/claims'
    );
  end if;

  return new;
end;
$$;

revoke all on function private.notify_claim_event() from public, anon, authenticated;

drop trigger if exists claims_create_notifications on public.claims;
drop trigger if exists claims_create_notifications_insert on public.claims;
drop trigger if exists claims_create_notifications_update on public.claims;

create trigger claims_create_notifications_insert
after insert on public.claims
for each row execute function private.notify_claim_event();

create trigger claims_create_notifications_update
after update of status on public.claims
for each row execute function private.notify_claim_event();

-- These private helpers reproduce the finalized Weighted Similarity Matching
-- rules against database values. They are intentionally not exposed through
-- the Data API, so an authenticated caller cannot supply or override a score.
create or replace function private.normalize_match_text(raw_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      replace(
        translate(
          regexp_replace(
            normalize(coalesce(raw_value, ''), NFKD),
            U&'[\0300-\036f]',
            '',
            'g'
          ),
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
          'abcdefghijklmnopqrstuvwxyz'
        ),
        '&',
        ' and '
      ),
      '[^a-z0-9]+',
      ' ',
      'g'
    )
  );
$$;

create or replace function private.match_text_similarity(left_value text, right_value text)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_left text := private.normalize_match_text(left_value);
  normalized_right text := private.normalize_match_text(right_value);
  left_token_count integer;
  right_token_count integer;
  overlap_count integer;
begin
  if normalized_left = '' or normalized_right = '' then
    return 0;
  end if;

  if normalized_left = normalized_right then
    return 1;
  end if;

  if least(length(normalized_left), length(normalized_right)) >= 3
     and (
       position(normalized_left in normalized_right) > 0
       or position(normalized_right in normalized_left) > 0
     ) then
    return 0.85;
  end if;

  select count(*)
  into left_token_count
  from (
    select distinct token
    from regexp_split_to_table(normalized_left, ' ') as parts(token)
    where length(token) >= 2
  ) left_tokens;

  select count(*)
  into right_token_count
  from (
    select distinct token
    from regexp_split_to_table(normalized_right, ' ') as parts(token)
    where length(token) >= 2
  ) right_tokens;

  if left_token_count = 0 or right_token_count = 0 then
    return 0;
  end if;

  select count(*)
  into overlap_count
  from (
    select distinct token
    from regexp_split_to_table(normalized_left, ' ') as parts(token)
    where length(token) >= 2
  ) left_tokens
  join (
    select distinct token
    from regexp_split_to_table(normalized_right, ' ') as parts(token)
    where length(token) >= 2
  ) right_tokens using (token);

  if overlap_count = 0 then
    return 0;
  end if;

  return (2.0 * overlap_count) / (left_token_count + right_token_count);
end;
$$;

create or replace function private.calculate_item_match_score(
  target_lost_id uuid,
  target_found_id uuid
)
returns integer
language plpgsql
stable
set search_path = ''
as $$
declare
  category_weight constant integer := 25;
  brand_weight constant integer := 15;
  color_weight constant integer := 15;
  location_weight constant integer := 15;
  date_weight constant integer := 15;
  description_weight constant integer := 15;
  total_weight constant integer := 100;
  minimum_match_score constant integer := 50;

  lost_category text;
  found_category text;
  lost_brand text;
  found_brand text;
  lost_color text;
  found_color text;
  lost_location text;
  found_location text;
  lost_description text;
  found_description text;
  lost_date date;
  found_date date;
  normalized_lost_color text;
  normalized_found_color text;
  similarity numeric;
  colors_related boolean;
  days_after integer;
  lost_keyword_count integer;
  found_keyword_count integer;
  shared_keyword_count integer;
  possible_keyword_overlap integer;
  score integer := 0;
begin
  select
    l.category,
    f.category,
    l.brand,
    f.brand,
    l.color,
    f.color,
    l.location,
    f.location,
    l.description,
    f.description,
    l.item_date,
    f.item_date
  into
    lost_category,
    found_category,
    lost_brand,
    found_brand,
    lost_color,
    found_color,
    lost_location,
    found_location,
    lost_description,
    found_description,
    lost_date,
    found_date
  from public.lost_items l
  join public.found_items f on f.id = target_found_id
  where l.id = target_lost_id;

  if not found then
    return null;
  end if;

  -- Stage 1: only equal, non-empty normalized categories are eligible.
  if private.normalize_match_text(lost_category) = ''
     or private.normalize_match_text(lost_category) <> private.normalize_match_text(found_category) then
    return null;
  end if;

  score := category_weight;

  -- Brand: exact 15, very similar 12, similar 7.
  similarity := private.match_text_similarity(lost_brand, found_brand);
  if similarity = 1 then
    score := score + brand_weight;
  elsif similarity >= 0.65 then
    score := score + 12;
  elsif similarity >= 0.35 then
    score := score + 7;
  end if;

  -- Color: exact 15, canonical alias overlap 12, text similarity 8.
  normalized_lost_color := private.normalize_match_text(lost_color);
  normalized_found_color := private.normalize_match_text(found_color);

  if normalized_lost_color <> '' and normalized_found_color <> '' then
    if normalized_lost_color = normalized_found_color then
      score := score + color_weight;
    else
      select exists (
        select 1
        from (
          select distinct case token
            when 'grey' then 'gray'
            when 'silver' then 'gray'
            when 'charcoal' then 'gray'
            when 'navy' then 'blue'
            when 'azure' then 'blue'
            when 'maroon' then 'red'
            when 'burgundy' then 'red'
            when 'crimson' then 'red'
            when 'violet' then 'purple'
            when 'lavender' then 'purple'
            when 'beige' then 'brown'
            when 'tan' then 'brown'
            when 'cream' then 'white'
            else token
          end as color_token
          from regexp_split_to_table(normalized_lost_color, ' ') as parts(token)
          where length(token) >= 2
        ) lost_colors
        join (
          select distinct case token
            when 'grey' then 'gray'
            when 'silver' then 'gray'
            when 'charcoal' then 'gray'
            when 'navy' then 'blue'
            when 'azure' then 'blue'
            when 'maroon' then 'red'
            when 'burgundy' then 'red'
            when 'crimson' then 'red'
            when 'violet' then 'purple'
            when 'lavender' then 'purple'
            when 'beige' then 'brown'
            when 'tan' then 'brown'
            when 'cream' then 'white'
            else token
          end as color_token
          from regexp_split_to_table(normalized_found_color, ' ') as parts(token)
          where length(token) >= 2
        ) found_colors using (color_token)
      ) into colors_related;

      if colors_related then
        score := score + 12;
      elsif private.match_text_similarity(normalized_lost_color, normalized_found_color) >= 0.5 then
        score := score + 8;
      end if;
    end if;
  end if;

  -- Location: exact 15, very similar 12, similar 8.
  similarity := private.match_text_similarity(lost_location, found_location);
  if similarity = 1 then
    score := score + location_weight;
  elsif similarity >= 0.65 then
    score := score + 12;
  elsif similarity >= 0.35 then
    score := score + 8;
  end if;

  -- Date: a found date before the lost date contributes zero points.
  if lost_date is not null and found_date is not null then
    days_after := found_date - lost_date;
    if days_after = 0 then
      score := score + date_weight;
    elsif days_after between 1 and 2 then
      score := score + 13;
    elsif days_after between 3 and 7 then
      score := score + 10;
    elsif days_after between 8 and 14 then
      score := score + 6;
    elsif days_after between 15 and 30 then
      score := score + 3;
    end if;
  end if;

  -- Description: shared non-stop-word keywords, weighted up to 15 points.
  with lost_keywords as (
    select distinct token
    from regexp_split_to_table(private.normalize_match_text(lost_description), ' ') as parts(token)
    where length(token) >= 3
      and token not in (
        'about', 'after', 'also', 'and', 'are', 'been', 'but', 'for', 'from',
        'had', 'has', 'have', 'into', 'item', 'lost', 'near', 'not', 'that',
        'the', 'their', 'there', 'this', 'was', 'were', 'with'
      )
  ),
  found_keywords as (
    select distinct token
    from regexp_split_to_table(private.normalize_match_text(found_description), ' ') as parts(token)
    where length(token) >= 3
      and token not in (
        'about', 'after', 'also', 'and', 'are', 'been', 'but', 'for', 'from',
        'had', 'has', 'have', 'into', 'item', 'lost', 'near', 'not', 'that',
        'the', 'their', 'there', 'this', 'was', 'were', 'with'
      )
  )
  select
    (select count(*) from lost_keywords),
    (select count(*) from found_keywords),
    (select count(*) from lost_keywords join found_keywords using (token))
  into lost_keyword_count, found_keyword_count, shared_keyword_count;

  possible_keyword_overlap := least(lost_keyword_count, found_keyword_count);
  if shared_keyword_count > 0 and possible_keyword_overlap > 0 then
    score := score + greatest(
      1,
      round(description_weight * shared_keyword_count::numeric / possible_keyword_overlap)::integer
    );
  end if;

  score := least(total_weight, score);
  return case when score >= minimum_match_score then score else null end;
end;
$$;

revoke all on function private.normalize_match_text(text) from public, anon, authenticated;
revoke all on function private.match_text_similarity(text, text) from public, anon, authenticated;
revoke all on function private.calculate_item_match_score(uuid, uuid) from public, anon, authenticated;

-- The caller supplies only candidate IDs. PostgreSQL independently calculates
-- the authoritative score from stored item data, returns that same score to the
-- Possible Matches page, and uses it in the deduplicated notification message.
drop function if exists public.sync_match_notifications(jsonb);

create or replace function public.sync_match_notifications(match_events jsonb)
returns table (
  lost_item_id uuid,
  found_item_id uuid,
  similarity_score integer,
  notification_created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  viewer_id uuid := auth.uid();
  match_event jsonb;
  lost_id uuid;
  found_id uuid;
  match_score integer;
  lost_name text;
  found_name text;
  inserted boolean;
begin
  if viewer_id is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;

  if match_events is null or jsonb_typeof(match_events) <> 'array' then
    raise exception 'Match events must be a JSON array' using errcode = '22023';
  end if;

  if jsonb_array_length(match_events) > 100 then
    raise exception 'At most 100 match events may be synchronized at once' using errcode = '22023';
  end if;

  for match_event in select value from jsonb_array_elements(match_events)
  loop
    if coalesce(match_event->>'lost_item_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
       or coalesce(match_event->>'found_item_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      continue;
    end if;

    lost_id := (match_event->>'lost_item_id')::uuid;
    found_id := (match_event->>'found_item_id')::uuid;

    select l.item_name, f.item_name
    into lost_name, found_name
    from public.lost_items l
    join public.found_items f on f.id = found_id
    where l.id = lost_id
      and l.reporter_id = viewer_id
      and l.status in ('open', 'matched')
      and f.status = 'open'
      and f.reporter_id <> viewer_id;

    if lost_name is null or found_name is null then
      continue;
    end if;

    match_score := private.calculate_item_match_score(lost_id, found_id);
    if match_score is null then
      continue;
    end if;

    inserted := private.insert_notification(
      viewer_id,
      'possible-match:' || lost_id::text || ':' || found_id::text,
      format('Possible Match: your lost "%s" may match found "%s" with a %s%% Similarity Score.', lost_name, found_name, match_score),
      'possible_match',
      '/matches/' || found_id::text || '/claim?lost=' || lost_id::text
    );

    return query select lost_id, found_id, match_score, inserted;
  end loop;
end;
$$;

revoke all on function public.sync_match_notifications(jsonb) from public, anon;
grant execute on function public.sync_match_notifications(jsonb) to authenticated;

-- Trigger helpers remain inaccessible through the Data API.
revoke all on function public.protect_notification_content() from public, anon, authenticated;

commit;
