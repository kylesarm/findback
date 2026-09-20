# FindMatch Supabase setup

## Apply the Stage 3 migration

1. Open the FindMatch project in the Supabase Dashboard.
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

## Configure authentication redirect URLs

Password recovery and email confirmation return through the application's
`/auth/confirm` route. In **Authentication → URL Configuration**, add the
development and deployed callback URLs that apply to your environment, for
example:

```text
http://localhost:3000/auth/confirm
https://your-findmatch-domain.example/auth/confirm
```

Set `NEXT_PUBLIC_SITE_URL` to the matching application origin in each
environment. Password-reset emails then verify the recovery token before
redirecting the user to `/reset-password`.

## Apply the Module 3 browse-and-search migration

For globally correct pagination across both lost and found reports, review and
run `migrations/202609190001_module3_browse_search.sql` in the SQL Editor. It
creates only the privacy-safe `item_listings` view and grants read access to
that projection. It does not change application tables or RLS policies.

Until this migration is applied, FindMatch falls back to querying the existing
`lost_item_listings` and `found_item_listings` views.

## Apply the Module 6 notifications migration

Review and run `migrations/202609200001_module6_notifications.sql` in the SQL
Editor. It extends the existing `notifications` table with a deduplication key
and safe internal destination, adds claim-event triggers, and adds the
authenticated `sync_match_notifications(jsonb)` RPC. Existing notification RLS
is tightened so only each recipient may select their own notifications, and
generated messages contain no private verification or profile information. The
RPC accepts only lost/found item IDs and independently recomputes the official
Weighted Similarity Matching score from stored item data; client-supplied
percentages are never trusted.
