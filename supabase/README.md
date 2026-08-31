# FindBack Supabase setup

## Apply the Stage 3 migration

1. Open the FindBack project in the Supabase Dashboard.
2. Open **SQL Editor** and create a new query.
3. Copy the full contents of `migrations/202608290001_stage3_core_schema.sql`.
4. Paste the SQL into the editor and select **Run**.
5. Confirm that `profiles`, `lost_items`, `found_items`, `claims`, and
   `notifications` appear under **Table Editor** with RLS enabled.

The migration also backfills a profile for every existing Auth user and creates
a trigger that adds profiles for future registrations.

## Assign the first administrator

All profiles start with the database-controlled `user` role. Promote a trusted
account from the SQL Editor only:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@your-campus.edu';
```

Replace the example address with the exact email of an existing Supabase Auth
user. Normal authenticated users cannot change this role through the API.

No service-role or secret key is required by the Next.js application.
