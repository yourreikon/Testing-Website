# EventMC private staff panel — setup guide

The site remains static on GitHub Pages. Supabase Free provides the database and email/password authentication. The panel is **not secure until you complete this setup**. Until then, the form and panel remain disabled by configuration.

## 1) Create the free backend
1. Create a Supabase project at https://supabase.com/ and save the database password somewhere private.
2. In the Supabase project, open **SQL Editor → New query**. Copy all of `supabase-schema.sql`, run it, and check that it completes successfully.
3. Open **Project Settings → API** (or Connect/API Keys, depending on dashboard layout). Copy the Project URL and the public `anon` / publishable key.
4. Edit `supabase-config.js` and replace `PASTE_SUPABASE_PROJECT_URL_HERE` and `PASTE_SUPABASE_ANON_KEY_HERE`. The public anon/publishable key is intended for browser use with RLS. **Never use `service_role` or any secret key in these files.**

## 2) Create the first authorized staff account
1. In Supabase, open **Authentication → Users → Add user** and create an account for the owner/admin. Do not enable public sign-ups. Use a strong unique password.
2. Copy that user's UUID from Authentication → Users.
3. In SQL Editor, run this after replacing the UUID and label:

```sql
insert into public.staff_members (user_id, staff_label, active)
values ('PASTE_AUTH_USER_UUID_HERE', 'EventMC Owner', true);
```

4. Open `staff-panel.html`, sign in with that email/password, and confirm the applications list loads. To add another staff member, create their Auth user and add their UUID to `staff_members`. To revoke access, run `update public.staff_members set active = false where user_id = 'THE-USER-UUID';` and they will no longer pass the panel's staff check.

## 3) Publish without exposing admin access
1. Keep `index.html`, `staff.html`, `apply.html`, `staff-panel.html`, `style.css`, `script.js`, `portal-common.js`, `apply.js`, `staff-panel.js`, `supabase-config.js`, and `assets/` in the same GitHub Pages repository root (assets remain inside `assets/`). Include `supabase-schema.sql` and this guide for your own setup reference.
2. The public can submit applications at `apply.html`. Only active accounts listed in `staff_members` can read/review them. The panel URL itself is not a secret; **database RLS is what protects the applications**, even if a player opens `staff-panel.html` directly.
3. In Supabase Authentication URL Configuration, set the Site URL to your actual GitHub Pages site URL and add that URL under Redirect URLs if requested. Password login does not require an OAuth redirect.
4. For extra safety, review Supabase Auth settings and leave public sign-up disabled. Never commit staff passwords, database passwords, or secret/service-role keys.

## What is private?
- Public visitors can only insert a new pending application.
- There is no public policy to read, update, or delete application rows.
- Only authenticated, active staff members can read and update application reviews.
- The static `staff-panel.html` file itself is publicly downloadable, but its data is protected by Supabase Row Level Security.

## Troubleshooting
- “Supabase isn't configured”: check the two values in `supabase-config.js`; use the Project URL and public anon/publishable key, not a secret key.
- Application submit fails: confirm the SQL ran, the URL/key are correct, and the `staff_applications` insert policy exists.
- Login works but applications do not load: confirm the signed-in user's UUID is in `staff_members` with `active = true`; check that RLS and grants from the SQL ran.
- The staff photos/logo still need to be uploaded to `assets/` with the exact filenames referenced in `staff.html`.

Supabase free-plan quotas and product settings can change. Check the current Supabase dashboard if a setting has moved.
