-- FindMatch Stage 6: Supabase Storage for report photos and profile avatars
-- Review this entire migration, then run it once in the Supabase SQL Editor.

begin;

-- These buckets are public only for image delivery. Upload, replacement, and
-- deletion still require an authenticated owner-scoped Storage policy.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('item-images', 'item-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public listings and account headers may retrieve these images. Public bucket
-- delivery is intentional; private claim proof never belongs in either bucket.
drop policy if exists "public_read_findback_images" on storage.objects;
create policy "public_read_findback_images"
on storage.objects for select to public
using (bucket_id in ('item-images', 'avatars'));

-- The first path segment must be the authenticated user's UUID. The app always
-- generates unique names and never uses upsert, preventing accidental overwrite.
drop policy if exists "users_insert_own_findback_images" on storage.objects;
drop policy if exists "users_update_own_findback_images" on storage.objects;
drop policy if exists "users_delete_own_findback_images" on storage.objects;

drop policy if exists "users_insert_own_item_images" on storage.objects;
create policy "users_insert_own_item_images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "users_update_own_item_images" on storage.objects;
create policy "users_update_own_item_images"
on storage.objects for update to authenticated
using (
  bucket_id = 'item-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'item-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[2] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "users_delete_own_item_images" on storage.objects;
create policy "users_delete_own_item_images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'item-images'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "users_insert_own_avatars" on storage.objects;
create policy "users_insert_own_avatars"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 1
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "users_update_own_avatars" on storage.objects;
create policy "users_update_own_avatars"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(name), 1) = 1
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

drop policy if exists "users_delete_own_avatars" on storage.objects;
create policy "users_delete_own_avatars"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Database paths must also remain inside the owning user's folder. This keeps a
-- report/profile from pointing at an image owned by another account.
create or replace function public.enforce_report_image_path_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.image_path is not null
     and (
       split_part(new.image_path, '/', 1) <> new.reporter_id::text
       or split_part(new.image_path, '/', 2) <> new.id::text
     ) then
    raise exception 'Report image path must belong to the reporter and report' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lost_items_enforce_image_owner on public.lost_items;
create trigger lost_items_enforce_image_owner
before insert or update of image_path, reporter_id on public.lost_items
for each row execute function public.enforce_report_image_path_owner();

drop trigger if exists found_items_enforce_image_owner on public.found_items;
create trigger found_items_enforce_image_owner
before insert or update of image_path, reporter_id on public.found_items
for each row execute function public.enforce_report_image_path_owner();

create or replace function public.enforce_avatar_path_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.avatar_path is not null
     and split_part(new.avatar_path, '/', 1) <> new.id::text then
    raise exception 'Avatar path must belong to the profile owner' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_avatar_owner on public.profiles;
create trigger profiles_enforce_avatar_owner
before insert or update of avatar_path, id on public.profiles
for each row execute function public.enforce_avatar_path_owner();

revoke all on function public.enforce_report_image_path_owner() from public, anon, authenticated;
revoke all on function public.enforce_avatar_path_owner() from public, anon, authenticated;

commit;
