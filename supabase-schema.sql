-- EventMC Staff Applications: run this in Supabase SQL Editor.
-- This enables RLS. Public visitors can INSERT applications only; only active staff can SELECT/UPDATE them.
create extension if not exists pgcrypto;

create table if not exists public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  staff_label text not null default 'Staff',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_applications (
  id uuid primary key default gen_random_uuid(),
  minecraft_username text not null check (char_length(minecraft_username) between 1 and 32),
  discord_username text not null check (char_length(discord_username) between 1 and 80),
  age_range text not null check (char_length(age_range) between 1 and 40),
  role_applied_for text not null check (char_length(role_applied_for) between 1 and 80),
  previous_experience text not null check (char_length(previous_experience) between 1 and 3000),
  why_join text not null check (char_length(why_join) between 1 and 3000),
  availability text not null default '' check (char_length(availability) <= 200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_notes text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.staff_members enable row level security;
alter table public.staff_applications enable row level security;

-- Signed-in staff can see their own staff membership row only. No client insert/delete policy: add staff through SQL editor.
drop policy if exists "Staff can read own membership" on public.staff_members;
create policy "Staff can read own membership" on public.staff_members
  for select to authenticated using (user_id = (select auth.uid()));

-- Anonymous and signed-in visitors can submit new pending applications. No read/update/delete policies for public users.
drop policy if exists "Public can submit pending applications" on public.staff_applications;
create policy "Public can submit pending applications" on public.staff_applications
  for insert to anon, authenticated
  with check (status = 'pending' and reviewed_by is null and reviewed_at is null and review_notes = '');

-- Only active staff members may read applications.
drop policy if exists "Active staff can read applications" on public.staff_applications;
create policy "Active staff can read applications" on public.staff_applications
  for select to authenticated using (exists (
    select 1 from public.staff_members sm
    where sm.user_id = (select auth.uid()) and sm.active = true
  ));

-- Only active staff members may update application review status.
drop policy if exists "Active staff can review applications" on public.staff_applications;
create policy "Active staff can review applications" on public.staff_applications
  for update to authenticated
  using (exists (select 1 from public.staff_members sm where sm.user_id = (select auth.uid()) and sm.active = true))
  with check (exists (select 1 from public.staff_members sm where sm.user_id = (select auth.uid()) and sm.active = true));

grant usage on schema public to anon, authenticated;
grant insert on public.staff_applications to anon, authenticated;
grant select, update on public.staff_applications to authenticated;
grant select on public.staff_members to authenticated;

-- IMPORTANT: create staff accounts in Supabase Authentication first. Then authorize each staff UUID manually:
-- insert into public.staff_members (user_id, staff_label, active) values ('PASTE_AUTH_USER_UUID_HERE', 'EventMC Admin', true);
-- Never add public sign-up or expose a service_role/secret key in GitHub Pages.
